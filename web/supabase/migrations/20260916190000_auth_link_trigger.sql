-- When someone signs in for the first time, auto-link their auth identity
-- to an existing contact with the same email (the admin-created-contact,
-- coworker-signs-up-later flow from section 14 of the brief). If no
-- matching contact exists yet, they simply get no public.users row and the
-- app can show a "not linked yet" state.

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact_id uuid;
begin
  select id into v_contact_id from contacts where email = new.email;

  if v_contact_id is not null then
    insert into users (id, contact_id)
    values (new.id, v_contact_id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
