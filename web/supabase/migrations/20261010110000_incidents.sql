-- Incidencias: anyone with app access reports a problem with the space
-- (category, description, optional photo); admins move it through
-- pending -> in_progress -> resolved with an optional note the reporter
-- sees. New reports notify every admin; updates notify the reporter.
-- (Push for both is sent from the app, like the other notifications.)

create table incidents (
  id uuid primary key default gen_random_uuid(),
  reporter_contact_id uuid not null references contacts (id) on delete cascade,
  category text not null check (
    category in ('internet', 'climate', 'cleaning', 'room', 'furniture', 'access', 'other')
  ),
  description text not null check (length(trim(description)) > 0),
  image_path text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index incidents_status_idx on incidents (status, created_at desc);
create index incidents_reporter_idx on incidents (reporter_contact_id);

create trigger incidents_set_updated_at
  before update on incidents
  for each row execute function set_updated_at();

alter table incidents enable row level security;

-- Admins see everything; everyone else sees their own reports plus any
-- still-open one (so the same problem isn't reported ten times). Who
-- reported an open one stays private: contacts RLS hides other people.
create policy "incidents: own, open or admin" on incidents
  for select using (
    auth_is_admin() or
    reporter_contact_id = auth_contact_id() or
    (auth_contact_id() is not null and status in ('pending', 'in_progress'))
  );

grant select on incidents to authenticated;
grant select, insert, update, delete on incidents to service_role;

-- ---------------------------------------------------------------------------
-- Photos: private bucket, signed URLs only. Each person uploads into a
-- folder named after their contact id; readable by them and by admins.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('incidents', 'incidents', false)
on conflict (id) do nothing;

create policy "incidents storage: own folder insert" on storage.objects
  for insert with check (
    bucket_id = 'incidents' and (storage.foldername(name))[1] = auth_contact_id()::text
  );

create policy "incidents storage: reporter or admin can read" on storage.objects
  for select using (
    bucket_id = 'incidents' and (
      auth_is_admin() or (storage.foldername(name))[1] = auth_contact_id()::text
    )
  );

-- ---------------------------------------------------------------------------
-- report_incident: creates it and an in-app notification for each admin.
-- ---------------------------------------------------------------------------

create or replace function report_incident(
  p_category text,
  p_description text,
  p_image_path text default null
)
returns incidents
language plpgsql
security definer
set search_path = public
as $$
declare
  v_incident incidents;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  insert into incidents (reporter_contact_id, category, description, image_path)
  values (auth_contact_id(), p_category, trim(p_description), nullif(p_image_path, ''))
  returning * into v_incident;

  insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
  select u.contact_id, 'incident_new', 'INCIDENT_NEW_TITLE', 'INCIDENT_NEW_BODY', '/admin/incidencias', v_incident.id
  from users u
  join contacts c on c.id = u.contact_id
  where u.role = 'admin' and c.status = 'active';

  return v_incident;
end;
$$;

grant execute on function report_incident(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- admin_update_incident: status + optional note; tells the reporter.
-- ---------------------------------------------------------------------------

create or replace function admin_update_incident(
  p_incident_id uuid,
  p_status text,
  p_note text default null
)
returns incidents
language plpgsql
security definer
set search_path = public
as $$
declare
  v_incident incidents;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update incidents
  set status = p_status,
      admin_note = nullif(trim(p_note), ''),
      resolved_at = case when p_status = 'resolved' then coalesce(resolved_at, now()) else null end
  where id = p_incident_id
  returning * into v_incident;

  if v_incident is null then
    raise exception 'INCIDENT_NOT_FOUND';
  end if;

  if v_incident.reporter_contact_id <> auth_contact_id() then
    insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
    values (
      v_incident.reporter_contact_id,
      'incident_update',
      'INCIDENT_UPDATE_TITLE',
      'INCIDENT_UPDATE_BODY',
      '/incidencias',
      v_incident.id
    );
  end if;

  return v_incident;
end;
$$;

grant execute on function admin_update_incident(uuid, text, text) to authenticated;
