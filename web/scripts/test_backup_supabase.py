import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import backup_supabase as backup


class BackupTests(unittest.TestCase):
    def test_paginated_and_nested_storage_inventory(self):
        requests = []

        def request(base, key, endpoint, body):
            requests.append((body['prefix'], body['offset']))
            if body['prefix'] == 'nested':
                return [{'id': 'child', 'name': 'photo.jpg', 'metadata': {'size': 3}}]
            if body['offset'] == 0:
                return [{'id': str(i), 'name': f'file-{i}'} for i in range(99)] + [{'id': None, 'name': 'nested'}]
            return [{'id': 'last', 'name': 'last.jpg'}]

        with patch.object(backup, 'storage_request', side_effect=request):
            objects = backup.list_objects('https://project.supabase.co', 'secret', [{'id': 'photos'}])
        self.assertEqual(len(objects), 101)
        self.assertIn(('', 100), requests)
        self.assertIn(('nested', 0), requests)
        self.assertIn('nested/photo.jpg', [item['name'] for item in objects])

    def test_storage_names_cannot_escape_backup_directory(self):
        objects = [{'bucket': '../bucket', 'name': '../../escape.txt', 'updated_at': 'now', 'metadata': {'size': 3}}]

        def request(base, key, endpoint, body=None, destination=None):
            if endpoint == 'bucket':
                return [{'id': '../bucket'}]
            destination.write_bytes(b'abc')

        with tempfile.TemporaryDirectory() as directory:
            payload = Path(directory) / 'payload'
            payload.mkdir()
            with patch.object(backup, 'storage_request', side_effect=request), patch.object(backup, 'list_objects', return_value=objects):
                count, size = backup.export_storage(payload, 'https://project.supabase.co', 'secret')
            self.assertEqual((count, size), (1, 3))
            manifest = json.loads((payload / 'storage-manifest.json').read_text())
            self.assertEqual(manifest['files'][0]['name'], '../../escape.txt')
            self.assertEqual(len(list((payload / 'storage').iterdir())), 1)
            self.assertFalse((Path(directory) / 'escape.txt').exists())

    def test_storage_change_and_incomplete_download_are_failures(self):
        original = [{'bucket': 'photos', 'name': 'one', 'metadata': {'size': 3}}]

        def request(base, key, endpoint, body=None, destination=None):
            if endpoint == 'bucket':
                return [{'id': 'photos'}]
            destination.write_bytes(b'abc')

        with tempfile.TemporaryDirectory() as directory:
            with patch.object(backup, 'storage_request', side_effect=request), patch.object(backup, 'list_objects', side_effect=[original, []]):
                with self.assertRaisesRegex(backup.BackupError, 'changed'):
                    backup.export_storage(Path(directory), 'https://project.supabase.co', 'secret')
        with tempfile.TemporaryDirectory() as directory:
            short = [{**original[0], 'metadata': {'size': 20}}]
            with patch.object(backup, 'storage_request', side_effect=request), patch.object(backup, 'list_objects', return_value=short):
                with self.assertRaisesRegex(backup.BackupError, 'size'):
                    backup.export_storage(Path(directory), 'https://project.supabase.co', 'secret')

    def test_command_failures_never_echo_credentials(self):
        result = subprocess.CompletedProcess(['command'], 1, stdout=b'data', stderr=b'password=DO_NOT_LOG')
        with patch.object(backup.subprocess, 'run', return_value=result):
            with self.assertRaises(backup.BackupError) as error:
                backup.run(['command'])
        self.assertNotIn('DO_NOT_LOG', str(error.exception))

    def test_export_without_auth_data_is_not_a_valid_backup(self):
        def run(command, **kwargs):
            Path(command[command.index('--file') + 1]).write_text('COPY public.contacts (id) FROM stdin;\n')

        with tempfile.TemporaryDirectory() as directory, patch.object(backup, 'run', side_effect=run):
            with self.assertRaisesRegex(backup.BackupError, 'missing public.memberships'):
                backup.export_database(Path(directory), 'project', None)


if __name__ == '__main__':
    unittest.main()
