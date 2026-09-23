-- Events module: internal activities (Christmas dinner, workshops,
-- afterworks...) with lightweight registration. No ticketing/payments/
-- QR/waitlist yet -- see project notes. Reuses plans for plan-based
-- audience targeting, the existing booking system for optional room
-- blocking, and the generic notifications table for the "new event" ping.

-- ---------------------------------------------------------------------------
-- Storage: event images are promotional, not sensitive like package
-- photos, so this bucket is public -- a plain public URL, no signing.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do nothing;

create policy "events storage: admin can write" on storage.objects
  for insert with check (bucket_id = 'events' and auth_is_admin());

create policy "events storage: admin can update" on storage.objects
  for update using (bucket_id = 'events' and auth_is_admin());

create policy "events storage: admin can delete" on storage.objects
  for delete using (bucket_id = 'events' and auth_is_admin());

create policy "events storage: anyone can read" on storage.objects
  for select using (bucket_id = 'events');

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_path text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  room_id uuid references rooms (id),
  block_room boolean not null default false,
  blocking_booking_id uuid references bookings (id),
  capacity integer check (capacity is null or capacity > 0),
  registered_count integer not null default 0,
  registration_deadline timestamptz,
  audience_type text not null default 'all' check (audience_type in ('all', 'plan', 'contacts')),
  audience_plan_id uuid references plans (id),
  status text not null default 'published' check (status in ('published', 'cancelled')),
  created_by uuid references contacts (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_range check (ends_at > starts_at),
  constraint events_audience_shape check (
    (audience_type = 'plan' and audience_plan_id is not null) or
    (audience_type <> 'plan' and audience_plan_id is null)
  )
);

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

create index events_starts_at_idx on events (starts_at);

-- Individually-targeted audience, only used when audience_type = 'contacts'.
create table event_audience_contacts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  unique (event_id, contact_id)
);

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  contact_id uuid not null references contacts (id),
  status text not null default 'registered' check (status in ('registered', 'cancelled')),
  registered_at timestamptz not null default now(),
  cancelled_at timestamptz,
  unique (event_id, contact_id)
);

create index event_registrations_event_id_idx on event_registrations (event_id);
create index event_registrations_contact_id_idx on event_registrations (contact_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table events enable row level security;
alter table event_audience_contacts enable row level security;
alter table event_registrations enable row level security;

-- A coworker can see an event they're in the audience for; admin sees all
-- (drafts included, if that ever gets added -- there's no draft state yet).
create policy "events: audience or admin" on events
  for select using (
    auth_is_admin() or
    audience_type = 'all' or
    (
      audience_type = 'plan' and exists (
        select 1 from memberships m
        where m.contact_id = auth_contact_id() and m.status = 'active' and m.plan_id = events.audience_plan_id
      )
    ) or
    (
      audience_type = 'contacts' and exists (
        select 1 from event_audience_contacts eac
        where eac.event_id = events.id and eac.contact_id = auth_contact_id()
      )
    )
  );

create policy "event_audience_contacts: admin only" on event_audience_contacts
  for select using (auth_is_admin());

-- Nominal attendee list is admin-only; a coworker can only ever see their
-- own registration (to render "Estás apuntado").
create policy "event_registrations: own or admin" on event_registrations
  for select using (auth_is_admin() or contact_id = auth_contact_id());

grant select on events, event_audience_contacts, event_registrations to authenticated;

-- ---------------------------------------------------------------------------
-- admin_create_event: creates the event, its audience list (if 'contacts'),
-- an optional room-blocking booking (reusing create_booking -- no
-- duplicated availability logic), and one notification per audience member.
-- ---------------------------------------------------------------------------

create or replace function admin_create_event(
  p_title text,
  p_description text,
  p_image_path text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_location text,
  p_room_id uuid,
  p_block_room boolean,
  p_capacity integer,
  p_registration_deadline timestamptz,
  p_audience_type text,
  p_audience_plan_id uuid,
  p_audience_contact_ids uuid[]
)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
  v_booking bookings;
  v_recipient_id uuid;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'INVALID_TIME_RANGE';
  end if;

  insert into events (
    title, description, image_path, starts_at, ends_at, location, room_id,
    block_room, capacity, registration_deadline, audience_type, audience_plan_id, created_by
  ) values (
    p_title, nullif(trim(coalesce(p_description, '')), ''), p_image_path, p_starts_at, p_ends_at,
    nullif(trim(coalesce(p_location, '')), ''), p_room_id, p_block_room, p_capacity,
    p_registration_deadline, p_audience_type, p_audience_plan_id, auth_contact_id()
  )
  returning * into v_event;

  if p_audience_type = 'contacts' and p_audience_contact_ids is not null then
    insert into event_audience_contacts (event_id, contact_id)
    select v_event.id, unnest(p_audience_contact_ids)
    on conflict do nothing;
  end if;

  if p_block_room and p_room_id is not null then
    v_booking := create_booking(
      p_room_id,
      null,
      p_starts_at,
      p_ends_at,
      'event',
      false,
      null,
      auth_contact_id()
    );

    update events set blocking_booking_id = v_booking.id where id = v_event.id
    returning * into v_event;
  end if;

  -- Notify the audience. `all` reaches every contact with an active
  -- membership (the ones actually using the app); `plan` and `contacts`
  -- are already exact lists.
  for v_recipient_id in
    select contact_id from memberships where status = 'active' and p_audience_type = 'all'
    union
    select contact_id from memberships
      where status = 'active' and plan_id = p_audience_plan_id and p_audience_type = 'plan'
    union
    select contact_id from event_audience_contacts
      where event_id = v_event.id and p_audience_type = 'contacts'
  loop
    insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
    values (v_recipient_id, 'event_new', 'EVENT_NEW_TITLE', 'EVENT_NEW_BODY', '/eventos/' || v_event.id, v_event.id);
  end loop;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_update_event: basic edit only (no date/room/audience changes in
-- this first version -- those have knock-on effects on the blocking
-- booking and already-sent notifications, left for later).
-- ---------------------------------------------------------------------------

create or replace function admin_update_event(
  p_event_id uuid,
  p_title text,
  p_description text,
  p_image_path text,
  p_location text,
  p_capacity integer,
  p_registration_deadline timestamptz
)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update events set
    title = p_title,
    description = nullif(trim(coalesce(p_description, '')), ''),
    image_path = p_image_path,
    location = nullif(trim(coalesce(p_location, '')), ''),
    capacity = p_capacity,
    registration_deadline = p_registration_deadline
  where id = p_event_id
  returning * into v_event;

  if v_event is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  return v_event;
end;
$$;

create or replace function admin_cancel_event(p_event_id uuid)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_event from events where id = p_event_id;
  if v_event is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if v_event.blocking_booking_id is not null then
    begin
      perform cancel_booking(v_event.blocking_booking_id, auth_contact_id());
    exception when others then
      null; -- already started/cancelled -- still cancel the event itself
    end;
  end if;

  update events set status = 'cancelled' where id = p_event_id
  returning * into v_event;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- register_for_event / cancel_event_registration
-- ---------------------------------------------------------------------------

create or replace function register_for_event(p_event_id uuid)
returns event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
  v_registration event_registrations;
  v_allowed boolean;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_event from events where id = p_event_id for update;
  if v_event is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if v_event.status <> 'published' then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  select
    v_event.audience_type = 'all' or
    (v_event.audience_type = 'plan' and exists (
      select 1 from memberships m
      where m.contact_id = auth_contact_id() and m.status = 'active' and m.plan_id = v_event.audience_plan_id
    )) or
    (v_event.audience_type = 'contacts' and exists (
      select 1 from event_audience_contacts eac
      where eac.event_id = v_event.id and eac.contact_id = auth_contact_id()
    ))
  into v_allowed;

  if not coalesce(v_allowed, false) and not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_event.registration_deadline is not null and v_event.registration_deadline < now() then
    raise exception 'REGISTRATION_CLOSED';
  end if;

  if v_event.ends_at < now() then
    raise exception 'REGISTRATION_CLOSED';
  end if;

  select * into v_registration
  from event_registrations
  where event_id = p_event_id and contact_id = auth_contact_id();

  if v_registration is not null and v_registration.status = 'registered' then
    return v_registration;
  end if;

  if v_event.capacity is not null and v_event.registered_count >= v_event.capacity then
    raise exception 'EVENT_FULL';
  end if;

  if v_registration is null then
    insert into event_registrations (event_id, contact_id)
    values (p_event_id, auth_contact_id())
    returning * into v_registration;
  else
    update event_registrations
    set status = 'registered', registered_at = now(), cancelled_at = null
    where id = v_registration.id
    returning * into v_registration;
  end if;

  update events set registered_count = registered_count + 1 where id = p_event_id;

  return v_registration;
end;
$$;

create or replace function cancel_event_registration(p_event_id uuid)
returns event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration event_registrations;
begin
  update event_registrations
  set status = 'cancelled', cancelled_at = now()
  where event_id = p_event_id and contact_id = auth_contact_id() and status = 'registered'
  returning * into v_registration;

  if v_registration is null then
    raise exception 'REGISTRATION_NOT_FOUND';
  end if;

  update events set registered_count = greatest(registered_count - 1, 0) where id = p_event_id;

  return v_registration;
end;
$$;

grant execute on function admin_create_event(text, text, text, timestamptz, timestamptz, text, uuid, boolean, integer, timestamptz, text, uuid, uuid[]) to authenticated;
grant execute on function admin_update_event(uuid, text, text, text, text, integer, timestamptz) to authenticated;
grant execute on function admin_cancel_event(uuid) to authenticated;
grant execute on function register_for_event(uuid) to authenticated;
grant execute on function cancel_event_registration(uuid) to authenticated;
