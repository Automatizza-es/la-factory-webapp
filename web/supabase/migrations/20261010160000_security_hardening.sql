-- Security review fixes.
--
-- 1. Archived people are locked out at the database level too: the auth
--    helpers every policy and RPC relies on stop recognising them, so a
--    still-valid session can't read or write anything (the app already
--    blocked them; this closes direct API calls).
-- 2. The name-only directories required no sign-in and, like any function,
--    were executable by `anon`: anyone with the public API key could list
--    names. They now need a signed-in, active user.
-- 3. process_booking_reminders() and booking_changes were reachable by app
--    users; neither should be.

create or replace function auth_contact_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.contact_id
  from users u
  join contacts c on c.id = u.contact_id
  where u.id = auth.uid() and c.status = 'active';
$$;

create or replace function auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select u.role = 'admin'
    from users u
    join contacts c on c.id = u.contact_id
    where u.id = auth.uid() and c.status = 'active'
  ), false);
$$;

create or replace function get_active_coworkers_directory()
returns table (id uuid, first_name text, last_name text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.first_name, c.last_name
  from contacts c
  where auth_contact_id() is not null
    and c.status = 'active'
    and (active_membership(c.id, (now() at time zone 'Europe/Madrid')::date)).id is not null;
$$;

create or replace function get_package_recipients_directory()
returns table (id uuid, first_name text, last_name text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.first_name, c.last_name
  from contacts c
  where auth_contact_id() is not null
    and c.status = 'active'
    and c.can_receive_packages
    and coalesce(trim(c.first_name), '') <> '';
$$;

revoke execute on function get_active_coworkers_directory() from public, anon;
revoke execute on function get_package_recipients_directory() from public, anon;
grant execute on function get_active_coworkers_directory() to authenticated, service_role;
grant execute on function get_package_recipients_directory() to authenticated, service_role;

-- Only pg_cron (as owner) runs this.
revoke execute on function process_booking_reminders() from public, anon, authenticated;

alter table booking_changes enable row level security;

create policy "booking_changes: admin only" on booking_changes
  for select using (auth_is_admin());
