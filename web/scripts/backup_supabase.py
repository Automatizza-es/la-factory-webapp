#!/usr/bin/env python3
"""Export Supabase DB + Storage, encrypt, and verify the archive locally.

Requires Supabase CLI, GnuPG, and Docker (or --native-pg-bin for local use).
Credentials and database output are never written to stdout/stderr.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

WEB = Path(__file__).resolve().parents[1]


class BackupError(Exception):
    pass


def load_local_environment():
    path = WEB / '.env.local'
    if path.exists():
        for line in path.read_text().splitlines():
            key, separator, value = line.partition('=')
            if separator and re.fullmatch(r'[A-Z_][A-Z_0-9]*', key.strip()):
                value = value.strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                    value = value[1:-1]
                os.environ.setdefault(key.strip(), value)


def required(name, fallback=None):
    value = os.environ.get(name) or (os.environ.get(fallback) if fallback else None)
    if not value:
        raise BackupError(f'Missing configuration: {name}')
    return value


def run(command, *, output=None, input_data=None, env=None, label='Command'):
    result = subprocess.run(command, cwd=WEB, input=input_data, stdout=output or subprocess.PIPE,
                            stderr=subprocess.PIPE, env=env, timeout=900)
    if result.returncode:
        # CLI/pg_dump errors can contain connection strings. Do not echo them.
        raise BackupError(f'{label} failed (exit {result.returncode}); check connectivity and authorization.')
    return result.stdout


def export_database(payload, project_ref, native_bin):
    for filename, flags in [
        ('roles.sql', ['--role-only']),
        ('schema.sql', []),
        ('data.sql', ['--data-only', '--use-copy']),
    ]:
        command = ['supabase', 'db', 'dump', '--project-ref', project_ref, *flags]
        target = payload / filename
        if native_bin:
            # Use the official CLI's generated export script, with a native
            # pg_dump instead of Docker. The script stays in memory/stdin.
            script = run([*command, '--dry-run'], label='Prepare database export')
            environment = dict(os.environ, PATH=str(native_bin) + os.pathsep + os.environ.get('PATH', ''))
            with target.open('wb') as output:
                run(['/bin/bash'], input_data=script, output=output, env=environment, label=filename)
        else:
            run([*command, '--file', str(target)], label=filename)
        if not target.is_file() or target.stat().st_size == 0:
            raise BackupError(f'Empty database export: {filename}')

    data = (payload / 'data.sql').read_text()
    for schema, table in [('public', 'contacts'), ('public', 'memberships'), ('auth', 'users')]:
        pattern = rf'COPY\s+"?{schema}"?\."?{table}"?\s*\('
        if not re.search(pattern, data):
            raise BackupError(f'Database export is missing {schema}.{table}')


def storage_request(base, key, endpoint, body=None, destination=None):
    encoded = json.dumps(body).encode() if body is not None else None
    headers = {'Authorization': 'Bearer ' + key, 'apikey': key}
    if encoded is not None:
        headers['Content-Type'] = 'application/json'
    request = Request(base + '/storage/v1/' + endpoint, data=encoded, headers=headers)
    for attempt in range(3):
        try:
            with urlopen(request, timeout=90) as response:
                if destination:
                    with destination.open('wb') as output:
                        shutil.copyfileobj(response, output)
                    return None
                return json.load(response)
        except HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise BackupError(f'Storage export failed (HTTP {error.code}).') from None
        except (URLError, TimeoutError):
            if attempt == 2:
                raise BackupError('Storage connection failed.') from None
        time.sleep(2 ** attempt)


def list_objects(base, key, buckets):
    objects = []
    for bucket in buckets:
        pending = ['']
        visited = set()
        while pending:
            prefix = pending.pop()
            if prefix in visited:
                raise BackupError('Unexpected repeated Storage directory.')
            visited.add(prefix)
            offset = 0
            while True:
                page = storage_request(base, key, 'object/list/' + quote(bucket['id'], safe=''), {
                    'prefix': prefix, 'limit': 100, 'offset': offset,
                    'sortBy': {'column': 'name', 'order': 'asc'},
                })
                if not isinstance(page, list):
                    raise BackupError('Unexpected Storage inventory response.')
                for item in page:
                    name = prefix + '/' + item['name'] if prefix else item['name']
                    if item.get('id') is None:
                        pending.append(name)
                    else:
                        objects.append({'bucket': bucket['id'], 'name': name,
                                        'updated_at': item.get('updated_at'), 'metadata': item.get('metadata')})
                if len(page) < 100:
                    break
                offset += len(page)
    return sorted(objects, key=lambda item: (item['bucket'], item['name']))


def checksum(path):
    digest = hashlib.sha256()
    with path.open('rb') as data:
        for chunk in iter(lambda: data.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def export_storage(payload, base, key):
    buckets = storage_request(base, key, 'bucket')
    if not isinstance(buckets, list):
        raise BackupError('Unexpected Storage bucket response.')
    objects = list_objects(base, key, buckets)
    target = payload / 'storage'
    target.mkdir(mode=0o700)
    files = []
    for item in objects:
        # Object names are untrusted paths. Use a hash as the local filename.
        local_name = hashlib.sha256((item['bucket'] + '/' + item['name']).encode()).hexdigest()
        path = target / local_name
        endpoint = 'object/' + quote(item['bucket'], safe='') + '/' + quote(item['name'], safe='/')
        storage_request(base, key, endpoint, destination=path)
        expected = (item.get('metadata') or {}).get('size')
        if expected is not None and path.stat().st_size != int(expected):
            raise BackupError('Storage file size does not match its inventory.')
        files.append({**item, 'path': 'storage/' + local_name, 'bytes': path.stat().st_size,
                      'sha256': checksum(path)})
    if objects != list_objects(base, key, buckets):
        raise BackupError('Storage changed during the backup; retry the complete run.')
    (payload / 'storage-manifest.json').write_text(json.dumps({'buckets': buckets, 'files': files}, indent=2))
    return len(files), sum(item['bytes'] for item in files)


def encrypt_and_verify(work, payload, destination, passphrase):
    manifest = {str(path.relative_to(payload)): {'sha256': checksum(path), 'bytes': path.stat().st_size}
                for path in sorted(payload.rglob('*')) if path.is_file()}
    (payload / 'checksums.json').write_text(json.dumps(manifest, indent=2))
    archive = work / 'backup.tar.gz'
    with tarfile.open(archive, 'w:gz') as tar:
        tar.add(payload, arcname='backup')
    secret_input = (passphrase + '\n').encode()
    gpg = ['gpg', '--batch', '--yes', '--pinentry-mode', 'loopback', '--passphrase-fd', '0']
    run([*gpg, '--symmetric', '--cipher-algo', 'AES256', '--output', str(destination), str(archive)],
        input_data=secret_input, label='Encrypt backup')
    verified = work / 'verified.tar.gz'
    run([*gpg, '--decrypt', '--output', str(verified), str(destination)],
        input_data=secret_input, label='Decrypt backup for verification')
    with tarfile.open(verified, 'r:gz') as tar:
        stored = json.load(tar.extractfile('backup/checksums.json'))
        if stored != manifest:
            raise BackupError('Backup manifest does not match.')
        for name, expected in stored.items():
            digest = hashlib.sha256()
            with tar.extractfile('backup/' + name) as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(chunk)
            if digest.hexdigest() != expected['sha256']:
                raise BackupError('Backup integrity verification failed.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, default=WEB.parent / '.backups' / 'supabase')
    parser.add_argument('--native-pg-bin', type=Path, help='Use native pg_dump/pg_dumpall instead of Docker.')
    args = parser.parse_args()
    os.umask(0o077)
    load_local_environment()
    passphrase = required('BACKUP_ENCRYPTION_PASSPHRASE')
    if len(passphrase) < 32 or '\n' in passphrase:
        raise BackupError('Use a recovery passphrase of at least 32 characters without newlines.')
    base = required('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL').rstrip('/')
    key = required('SUPABASE_SERVICE_ROLE_KEY')
    ref_file = WEB / 'supabase' / '.temp' / 'project-ref'
    project_ref = os.environ.get('SUPABASE_PROJECT_REF') or (ref_file.read_text().strip() if ref_file.exists() else '')
    if not re.fullmatch(r'[a-z0-9]+', project_ref) or urlparse(base).hostname != project_ref + '.supabase.co':
        raise BackupError('Project reference and Supabase URL do not match.')
    args.output_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H-%M-%SZ')
    destination = args.output_dir / ('la-factory-' + timestamp + '.tar.gz.gpg')
    if destination.exists():
        raise BackupError('A backup with this timestamp already exists.')
    try:
        with tempfile.TemporaryDirectory(prefix='.working-', dir=args.output_dir) as temporary:
            work = Path(temporary)
            payload = work / 'payload'
            payload.mkdir(mode=0o700)
            export_database(payload, project_ref, args.native_pg_bin)
            count, size = export_storage(payload, base, key)
            shutil.copytree(WEB / 'supabase' / 'migrations', payload / 'migrations')
            metadata = {'created_at': timestamp, 'project_ref': project_ref, 'storage_files': count,
                        'storage_bytes': size, 'restore_test': 'Archive decryption and SHA-256 verification; not a full database restore.',
                        'consistency': 'Database data uses its own dump snapshot; Storage is checked separately before and after download.'}
            (payload / 'metadata.json').write_text(json.dumps(metadata, indent=2))
            encrypt_and_verify(work, payload, destination, passphrase)
        sidecar = destination.with_suffix(destination.suffix + '.sha256')
        sidecar.write_text(checksum(destination) + '  ' + destination.name + '\n')
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    print(json.dumps({'archive': destination.name, 'bytes': destination.stat().st_size,
                      'storage_files': count, 'integrity_verified': True}))


if __name__ == '__main__':
    try:
        main()
    except BackupError as error:
        print('Backup failed: ' + str(error), file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        # Never log raw subprocess output, network responses or environments.
        print('Backup failed: ' + type(error).__name__, file=sys.stderr)
        sys.exit(1)
