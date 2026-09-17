alter table rooms add column image_path text;

update rooms set image_path = '/rooms/meeting-room.png' where code = 'meeting-room';
update rooms set image_path = '/rooms/territori-creatiu.png' where code = 'territori-creatiu';
