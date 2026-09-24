-- Booking reminders (1h before, in-app + optional Web Push) and generic
-- per-type notification preferences. Reuses the existing `notifications`
-- table/rendering pattern (type + related_id, resolved client-side) for
-- the in-app half, and adds a small push-subscription store for the
-- optional device push. Scheduling runs entirely inside Postgres via
-- pg_cron + pg_net so it doesn't depend on Vercel Cron's plan limits.

-- Clean up the throwaway secret from the earlier extension-availability
-- probe migration.
delete from vault.secrets where name = 'test_probe_secret';

select vault.create_secret(
  '00c6dd3c9646dc3388300109bd949891592913d286296e29bc0d6e5d444e9c42',
  'push_cron_secret',
  'Shared secret pg_net sends to /api/push/send so that endpoint only accepts calls from our own cron function.'
);

-- ---------------------------------------------------------------------------
-- notification_preferences: per-contact on/off switches. Missing row means
-- "everything enabled" (existing users before this feature shipped), so
-- every read path treats NULL/no-row as true via coalesce.
-- ---------------------------------------------------------------------------

create table notification_preferences (
  contact_id uuid primary key references contacts (id) on delete cascade,
  booking_reminders boolean not null default true,
  packages boolean not null default true,
  events boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger notification_preferences_set_updated_at
  before update on notification_preferences
  for each row execute function set_updated_at();

alter table notification_preferences enable row level security;

create policy "notification_preferences: own only" on notification_preferences
  for select using (contact_id = auth_contact_id());

grant select on notification_preferences to authenticated;
grant select, insert, update, delete on notification_preferences to service_role;

create or replace function get_notification_preferences()
returns notification_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefs notification_preferences;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_prefs from notification_preferences where contact_id = auth_contact_id();

  if v_prefs is null then
    v_prefs.contact_id := auth_contact_id();
    v_prefs.booking_reminders := true;
    v_prefs.packages := true;
    v_prefs.events := true;
  end if;

  return v_prefs;
end;
$$;

create or replace function update_notification_preferences(
  p_booking_reminders boolean,
  p_packages boolean,
  p_events boolean
)
returns notification_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefs notification_preferences;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  insert into notification_preferences (contact_id, booking_reminders, packages, events)
  values (auth_contact_id(), p_booking_reminders, p_packages, p_events)
  on conflict (contact_id) do update set
    booking_reminders = excluded.booking_reminders,
    packages = excluded.packages,
    events = excluded.events,
    updated_at = now()
  returning * into v_prefs;

  return v_prefs;
end;
$$;

grant execute on function get_notification_preferences() to authenticated;
grant execute on function update_notification_preferences(boolean, boolean, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- push_subscriptions: one row per browser/device the coworker opted into
-- push on. `endpoint` is the natural unique key a given subscription.
-- ---------------------------------------------------------------------------

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_contact_id_idx on push_subscriptions (contact_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions: own only" on push_subscriptions
  for select using (contact_id = auth_contact_id());

grant select on push_subscriptions to authenticated;
grant select, delete on push_subscriptions to service_role;

create or replace function save_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  insert into push_subscriptions (contact_id, endpoint, p256dh, auth, user_agent)
  values (auth_contact_id(), p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (endpoint) do update set
    contact_id = excluded.contact_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent;
end;
$$;

create or replace function delete_push_subscription(p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  delete from push_subscriptions where endpoint = p_endpoint and contact_id = auth_contact_id();
end;
$$;

grant execute on function save_push_subscription(text, text, text, text) to authenticated;
grant execute on function delete_push_subscription(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Booking reminders
-- ---------------------------------------------------------------------------

alter table bookings add column reminder_sent_at timestamptz;

-- Runs every minute via pg_cron below. Picks up confirmed, owned bookings
-- starting within the next hour that haven't been reminded yet, marks them
-- reminded (before doing anything else, so a slow loop iteration can never
-- double-send), creates the in-app notification if the coworker hasn't
-- turned reminders off, and fires an async pg_net call to our own
-- /api/push/send endpoint to additionally push it to their device(s).
create or replace function process_booking_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_secret text;
  v_wants_reminder boolean;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_cron_secret';

  for v_booking in
    select b.id, b.contact_id, b.starts_at, b.ends_at, r.name as room_name
    from bookings b
    join rooms r on r.id = b.room_id
    where b.status = 'confirmed'
      and b.contact_id is not null
      and b.reminder_sent_at is null
      and b.starts_at > now()
      and b.starts_at <= now() + interval '60 minutes'
    for update of b skip locked
  loop
    update bookings set reminder_sent_at = now() where id = v_booking.id;

    select coalesce(
      (select booking_reminders from notification_preferences where contact_id = v_booking.contact_id),
      true
    ) into v_wants_reminder;

    if v_wants_reminder then
      insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
      values (
        v_booking.contact_id,
        'booking_reminder',
        'BOOKING_REMINDER_TITLE',
        'BOOKING_REMINDER_BODY',
        '/reservas#reserva-' || v_booking.id,
        v_booking.id
      );

      if v_secret is not null then
        perform net.http_post(
          url := 'https://web-six-liart-89.vercel.app/api/push/send',
          headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
          body := jsonb_build_object(
            'contactId', v_booking.contact_id,
            'bookingId', v_booking.id,
            'roomName', v_booking.room_name,
            'startsAt', v_booking.starts_at,
            'endsAt', v_booking.ends_at
          )
        );
      end if;
    end if;
  end loop;
end;
$$;

select cron.schedule('process-booking-reminders', '* * * * *', $$select process_booking_reminders();$$);

-- ---------------------------------------------------------------------------
-- Gate the existing package/event notification creators by preferences,
-- same coalesce-to-true-when-no-row rule as above.
-- ---------------------------------------------------------------------------

create or replace function register_package(
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
  v_wants_notification boolean;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from contacts where id = p_recipient_contact_id) then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  insert into packages (recipient_contact_id, image_path, note, received_by)
  values (p_recipient_contact_id, p_image_path, nullif(trim(coalesce(p_note, '')), ''), auth_contact_id())
  returning * into v_package;

  select coalesce(
    (select packages from notification_preferences where contact_id = p_recipient_contact_id),
    true
  ) into v_wants_notification;

  if v_wants_notification then
    insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
    values (
      p_recipient_contact_id,
      'package_received',
      'PACKAGE_RECEIVED_TITLE',
      'PACKAGE_RECEIVED_BODY',
      '/paquetes',
      v_package.id
    );
  end if;

  return v_package;
end;
$$;

grant execute on function register_package(uuid, text, text) to authenticated;

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

  for v_recipient_id in
    select contact_id from memberships where status = 'active' and p_audience_type = 'all'
    union
    select contact_id from memberships
      where status = 'active' and plan_id = p_audience_plan_id and p_audience_type = 'plan'
    union
    select contact_id from event_audience_contacts
      where event_id = v_event.id and p_audience_type = 'contacts'
  loop
    if coalesce((select events from notification_preferences where contact_id = v_recipient_id), true) then
      insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
      values (v_recipient_id, 'event_new', 'EVENT_NEW_TITLE', 'EVENT_NEW_BODY', '/eventos/' || v_event.id, v_event.id);
    end if;
  end loop;

  return v_event;
end;
$$;

grant execute on function admin_create_event(text, text, text, timestamptz, timestamptz, text, uuid, boolean, integer, timestamptz, text, uuid, uuid[]) to authenticated;
