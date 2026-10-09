-- Events, complete version:
-- - 'draft' status: prepared without anyone seeing it; publishing notifies.
-- - "Finalizado" is derived (ends_at in the past), not stored.
-- - Audience 'all' now reaches guests too (the whole active community),
--   and 'plan' counts people sharing that plan's hours.
-- - Date/time can be edited; registered people are told about changes and
--   cancellations, and get a reminder the day before (daily job).
-- Push for all of these is sent by the app, like other notifications.

alter table events drop constraint events_status_check;
alter table events add constraint events_status_check
  check (status in ('draft', 'published', 'cancelled'));

alter table events add column reminder_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- my_plan_id: the caller's plan in force today (own or shared). Policies run
-- with the caller's rights and active_membership() isn't executable by app
-- users, hence this narrow SECURITY DEFINER wrapper.
-- ---------------------------------------------------------------------------

create or replace function my_plan_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select (active_membership(auth_contact_id(), (now() at time zone 'Europe/Madrid')::date)).plan_id;
$$;

grant execute on function my_plan_id() to authenticated;

drop policy "events: audience or admin" on events;

create policy "events: audience or admin" on events
  for select using (
    auth_is_admin() or (
      status <> 'draft' and (
        audience_type = 'all' or
        (audience_type = 'plan' and audience_plan_id = my_plan_id()) or
        (
          audience_type = 'contacts' and exists (
            select 1 from event_audience_contacts eac
            where eac.event_id = events.id and eac.contact_id = auth_contact_id()
          )
        )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Internal helpers
-- ---------------------------------------------------------------------------

-- Everyone the event is for: active, non-admin contacts in its audience.
create or replace function event_audience_contact_ids(p_event_id uuid)
returns table (contact_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from events e
  join contacts c on c.status = 'active'
  where e.id = p_event_id
    and not exists (select 1 from users u where u.contact_id = c.id and u.role = 'admin')
    and (
      e.audience_type = 'all'
      or (
        e.audience_type = 'plan'
        and (active_membership(c.id, (now() at time zone 'Europe/Madrid')::date)).plan_id = e.audience_plan_id
      )
      or (
        e.audience_type = 'contacts'
        and exists (
          select 1 from event_audience_contacts eac where eac.event_id = e.id and eac.contact_id = c.id
        )
      )
    );
$$;

-- "New event" for the audience, respecting each person's preferences.
create or replace function notify_event_audience(p_event_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
  select a.contact_id, 'event_new', 'EVENT_NEW_TITLE', 'EVENT_NEW_BODY', '/eventos/' || p_event_id, p_event_id
  from event_audience_contact_ids(p_event_id) a
  where coalesce((select events from notification_preferences np where np.contact_id = a.contact_id), true);
$$;

-- Change / cancellation / reminder for the people registered. Always sent:
-- they signed up, so it affects them.
create or replace function notify_event_registered(p_event_id uuid, p_type text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
  select r.contact_id, p_type, upper(p_type), upper(p_type), '/eventos/' || p_event_id, p_event_id
  from event_registrations r
  where r.event_id = p_event_id and r.status = 'registered';
$$;

revoke execute on function event_audience_contact_ids(uuid) from public;
revoke execute on function notify_event_audience(uuid) from public;
revoke execute on function notify_event_registered(uuid, text) from public;

-- ---------------------------------------------------------------------------
-- admin_create_event: now with a status ('draft' or 'published'); only a
-- published event notifies its audience.
-- ---------------------------------------------------------------------------

drop function admin_create_event(text, text, text, timestamptz, timestamptz, text, uuid, boolean, integer, timestamptz, text, uuid, uuid[]);

create function admin_create_event(
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
  p_audience_contact_ids uuid[],
  p_status text default 'published'
)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
  v_booking bookings;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'INVALID_TIME_RANGE';
  end if;
  if p_status not in ('draft', 'published') then
    raise exception 'INVALID_STATUS';
  end if;

  insert into events (
    title, description, image_path, starts_at, ends_at, location, room_id,
    block_room, capacity, registration_deadline, audience_type, audience_plan_id, created_by, status
  ) values (
    p_title, nullif(trim(coalesce(p_description, '')), ''), p_image_path, p_starts_at, p_ends_at,
    nullif(trim(coalesce(p_location, '')), ''), p_room_id, p_block_room, p_capacity,
    p_registration_deadline, p_audience_type, p_audience_plan_id, auth_contact_id(), p_status
  )
  returning * into v_event;

  if p_audience_type = 'contacts' and p_audience_contact_ids is not null then
    insert into event_audience_contacts (event_id, contact_id)
    select v_event.id, unnest(p_audience_contact_ids)
    on conflict do nothing;
  end if;

  -- The room is held even for drafts, so nobody books it meanwhile.
  if p_block_room and p_room_id is not null then
    v_booking := create_booking(p_room_id, null, p_starts_at, p_ends_at, 'event', false, null, auth_contact_id());
    update events set blocking_booking_id = v_booking.id where id = v_event.id
    returning * into v_event;
  end if;

  if p_status = 'published' then
    perform notify_event_audience(v_event.id);
  end if;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_publish_event: draft -> published, and the audience is told.
-- ---------------------------------------------------------------------------

create or replace function admin_publish_event(p_event_id uuid)
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

  update events set status = 'published'
  where id = p_event_id and status = 'draft'
  returning * into v_event;

  if v_event is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  perform notify_event_audience(v_event.id);
  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_update_event: now also date/time. The room hold moves with it, and
-- registered people are told if a published event changes time.
-- ---------------------------------------------------------------------------

drop function admin_update_event(uuid, text, text, text, text, integer, timestamptz);

create function admin_update_event(
  p_event_id uuid,
  p_title text,
  p_description text,
  p_image_path text,
  p_location text,
  p_capacity integer,
  p_registration_deadline timestamptz,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old events;
  v_event events;
  v_booking bookings;
  v_time_changed boolean;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'INVALID_TIME_RANGE';
  end if;

  select * into v_old from events where id = p_event_id for update;
  if v_old is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  v_time_changed := v_old.starts_at <> p_starts_at or v_old.ends_at <> p_ends_at;

  if v_time_changed and v_old.blocking_booking_id is not null then
    v_booking := modify_booking(v_old.blocking_booking_id, v_old.room_id, p_starts_at, p_ends_at, auth_contact_id());
  end if;

  update events set
    title = p_title,
    description = nullif(trim(coalesce(p_description, '')), ''),
    image_path = p_image_path,
    location = nullif(trim(coalesce(p_location, '')), ''),
    capacity = p_capacity,
    registration_deadline = p_registration_deadline,
    starts_at = p_starts_at,
    ends_at = p_ends_at,
    blocking_booking_id = coalesce(v_booking.id, blocking_booking_id),
    -- A new date means a new reminder.
    reminder_sent_at = case when v_time_changed then null else reminder_sent_at end
  where id = p_event_id
  returning * into v_event;

  if v_time_changed and v_event.status = 'published' then
    perform notify_event_registered(v_event.id, 'event_changed');
  end if;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_cancel_event: as before, plus registered people are told.
-- ---------------------------------------------------------------------------

create or replace function admin_cancel_event(p_event_id uuid)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
  v_was_published boolean;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_event from events where id = p_event_id;
  if v_event is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;
  v_was_published := v_event.status = 'published';

  if v_event.blocking_booking_id is not null then
    begin
      perform cancel_booking(v_event.blocking_booking_id, auth_contact_id());
    exception when others then
      null; -- already started/cancelled -- still cancel the event itself
    end;
  end if;

  update events set status = 'cancelled' where id = p_event_id
  returning * into v_event;

  if v_was_published then
    perform notify_event_registered(v_event.id, 'event_cancelled');
  end if;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- register_for_event: same rules, but 'plan' audiences include shared hours.
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
  if v_event is null or v_event.status <> 'published' then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  v_allowed := exists (
    select 1 from event_audience_contact_ids(p_event_id) a where a.contact_id = auth_contact_id()
  );
  if not v_allowed and not auth_is_admin() then
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

grant execute on function admin_create_event(text, text, text, timestamptz, timestamptz, text, uuid, boolean, integer, timestamptz, text, uuid, uuid[], text) to authenticated;
grant execute on function admin_publish_event(uuid) to authenticated;
grant execute on function admin_update_event(uuid, text, text, text, text, integer, timestamptz, timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Day-before reminders: a daily job asks the app to send them (it inserts
-- the notifications and the push), same secret as the other jobs.
-- ---------------------------------------------------------------------------

create or replace function trigger_event_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_cron_secret';
  if v_secret is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://hub.lafactorycoworking.com/api/events/reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$$;

revoke execute on function trigger_event_reminders() from public, anon, authenticated;

-- 08:00 UTC = 09:00/10:00 in Madrid: a reasonable time to get a reminder.
select cron.schedule('event-reminders', '0 8 * * *', $$select trigger_event_reminders();$$);
