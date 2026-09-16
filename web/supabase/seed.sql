-- Seed data for local development. Matches the rooms and plan minute
-- allotments confirmed in the project brief. Hot Desk's allowed weekdays are
-- intentionally left unconfigured (see plan_schedules comment in the
-- migration) until that decision is made.

insert into rooms (code, name, capacity_min, capacity_max) values
  ('meeting-room', 'La Meeting Room', 2, 4),
  ('territori-creatiu', 'Territori Creatiu', 2, 4);

insert into plans (code, name, monthly_minutes, allow_all_day, allow_weekends) values
  ('fixed', 'Fixed', 1200, true, true),
  ('hot_desk', 'Hot Desk', 600, false, false);
