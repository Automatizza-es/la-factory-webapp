-- Seed data for local development. Matches the rooms and plan minute
-- allotments confirmed in the project brief. Idempotent (on conflict do
-- nothing) since supabase db push re-runs this file in full every time.

insert into rooms (code, name, capacity_min, capacity_max) values
  ('meeting-room', 'La Meeting Room', 2, 4),
  ('territori-creatiu', 'Territori Creatiu', 2, 4)
on conflict (code) do nothing;

insert into plans (code, name, monthly_minutes, allow_all_day, allow_weekends) values
  ('fixed', 'Fixed', 1200, true, true),
  ('hot_desk', 'Hot Desk', 600, false, false)
on conflict (code) do nothing;

-- Hot Desk: Monday(1)-Friday(5), 09:00-19:00. Confirmed by the user on
-- 2026-09-16 (previously pending).
insert into plan_schedules (plan_id, weekday, start_minute, end_minute)
select p.id, weekday, 540, 1140
from plans p, unnest(array[1, 2, 3, 4, 5]) as weekday
where p.code = 'hot_desk'
on conflict (plan_id, weekday) do nothing;
