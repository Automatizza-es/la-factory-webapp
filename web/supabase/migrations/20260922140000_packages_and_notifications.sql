-- Package reception + a generic in-app notification system (reused for
-- future notification types, not package-specific), replacing the
-- WhatsApp-group announcement with a private, per-coworker flow.

-- ---------------------------------------------------------------------------
-- packages
-- ---------------------------------------------------------------------------

create table packages (
  id uuid primary key default gen_random_uuid(),
  recipient_contact_id uuid not null references contacts (id),
  image_path text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'collected')),
  received_at timestamptz not null default now(),
  received_by uuid references contacts (id),
  collected_at timestamptz,
  collected_by uuid references contacts (id),
  created_at timestamptz not null default now(),
  constraint packages_collected_shape check (
    (status = 'collected' and collected_at is not null) or
    (status = 'pending' and collected_at is null)
  )
);

create index packages_recipient_id_idx on packages (recipient_contact_id);
create index packages_status_idx on packages (status);

alter table packages enable row level security;

create policy "packages: recipient or admin" on packages
  for select using (auth_is_admin() or recipient_contact_id = auth_contact_id());

grant select on packages to authenticated;

-- ---------------------------------------------------------------------------
-- notifications: generic, not package-specific -- `type` + `related_id` let
-- future features (booking reminders, etc.) reuse this same table and the
-- same bell UI instead of building their own.
-- ---------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_contact_id uuid not null references contacts (id),
  type text not null,
  title text not null,
  body text,
  link_path text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_id_idx on notifications (recipient_contact_id, created_at desc);

alter table notifications enable row level security;

create policy "notifications: own only" on notifications
  for select using (recipient_contact_id = auth_contact_id());

grant select on notifications to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: a private bucket for package photos. Never publicly readable --
-- access goes through signed URLs, gated by the same RLS policies as any
-- other table (via a join back to `packages`).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('packages', 'packages', false)
on conflict (id) do nothing;

create policy "packages storage: admin can insert" on storage.objects
  for insert with check (bucket_id = 'packages' and auth_is_admin());

create policy "packages storage: admin can delete" on storage.objects
  for delete using (bucket_id = 'packages' and auth_is_admin());

create policy "packages storage: recipient or admin can read" on storage.objects
  for select using (
    bucket_id = 'packages' and (
      auth_is_admin() or
      exists (
        select 1 from packages p
        where p.image_path = storage.objects.name
          and p.recipient_contact_id = auth_contact_id()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- admin_register_package: registers the package and its notification in one
-- transaction. Email sending happens from the app layer (RPCs don't send
-- email), right after this succeeds.
-- ---------------------------------------------------------------------------

create or replace function admin_register_package(
  p_recipient_contact_id uuid,
  p_image_path text,
  p_note text
)
returns packages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_package packages;
  v_recipient_name text;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from contacts where id = p_recipient_contact_id) then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  insert into packages (recipient_contact_id, image_path, note, received_by)
  values (p_recipient_contact_id, p_image_path, nullif(trim(coalesce(p_note, '')), ''), auth_contact_id())
  returning * into v_package;

  select first_name into v_recipient_name from contacts where id = p_recipient_contact_id;

  insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
  values (
    p_recipient_contact_id,
    'package_received',
    'PACKAGE_RECEIVED_TITLE',
    'PACKAGE_RECEIVED_BODY',
    '/paquetes',
    v_package.id
  );

  return v_package;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_mark_package_collected
-- ---------------------------------------------------------------------------

create or replace function admin_mark_package_collected(p_package_id uuid)
returns packages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_package packages;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update packages
  set status = 'collected', collected_at = now(), collected_by = auth_contact_id()
  where id = p_package_id and status = 'pending'
  returning * into v_package;

  if v_package is null then
    raise exception 'PACKAGE_NOT_FOUND';
  end if;

  return v_package;
end;
$$;

-- ---------------------------------------------------------------------------
-- mark_notification_read: the recipient themselves, marking their own.
-- ---------------------------------------------------------------------------

create or replace function mark_notification_read(p_notification_id uuid)
returns notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification notifications;
begin
  update notifications
  set read_at = now()
  where id = p_notification_id and recipient_contact_id = auth_contact_id() and read_at is null
  returning * into v_notification;

  if v_notification is null then
    select * into v_notification from notifications
    where id = p_notification_id and recipient_contact_id = auth_contact_id();
  end if;

  if v_notification is null then
    raise exception 'NOTIFICATION_NOT_FOUND';
  end if;

  return v_notification;
end;
$$;

grant execute on function admin_register_package(uuid, text, text) to authenticated;
grant execute on function admin_mark_package_collected(uuid) to authenticated;
grant execute on function mark_notification_read(uuid) to authenticated;
