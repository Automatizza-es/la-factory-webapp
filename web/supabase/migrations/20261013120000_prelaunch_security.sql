-- Pre-launch review fixes.
--
-- 1. create_booking was callable by any signed-in user with all eight
--    parameters, so a coworker calling the API directly could book without
--    spending hours (p_consumes_quota = false), on someone else's hours
--    (p_quota_account_id) or with no plan at all. The full version is now
--    internal (create_booking_core); the public create_booking only lets
--    admins and the service role pass the extra parameters. Coworkers always
--    book for themselves, against their own plan.
-- 2. modify_booking calls the internal version with the original booking's
--    values, and only admins may say who made the change.
-- 3. The event notification helpers were only revoked from PUBLIC, but
--    Supabase grants anon/authenticated execute on functions directly, so
--    anyone could insert notifications for an event's audience.
-- 4. Upload buckets get a size limit and image-only types.

-- ---------------------------------------------------------------------------
-- 1. create_booking_core: the previous create_booking, unchanged.
-- ---------------------------------------------------------------------------

create or replace function create_booking_core(
  p_room_id uuid,
  p_contact_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_booking_type text default 'coworker',
  p_consumes_quota boolean default true,
  p_quota_account_id uuid default null,
  p_created_by uuid default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
  v_membership memberships;
  v_plan plans;
  v_quota_account_id uuid := p_quota_account_id;
  v_period quota_periods;
  v_balance integer;
  v_local_start timestamp := p_starts_at at time zone 'Europe/Madrid';
  v_local_end timestamp := p_ends_at at time zone 'Europe/Madrid';
  v_local_date date := v_local_start::date;
  v_weekday int := extract(isodow from v_local_start)::int;
  v_minutes int := round(extract(epoch from (p_ends_at - p_starts_at)) / 60);
  v_start_minute int := extract(hour from v_local_start)::int * 60 + extract(minute from v_local_start)::int;
  v_end_minute int;
  v_schedule plan_schedules;
begin
  if not coalesce(
    auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = p_contact_id,
    false
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'INVALID_TIME_RANGE';
  end if;

  if p_starts_at <= now() then
    raise exception 'BOOKING_MUST_BE_FUTURE';
  end if;

  if v_local_date <> v_local_end::date then
    raise exception 'SAME_DAY_REQUIRED';
  end if;

  v_end_minute := v_start_minute + v_minutes;

  if not exists (select 1 from rooms where id = p_room_id and is_active) then
    raise exception 'ROOM_UNAVAILABLE';
  end if;

  if p_consumes_quota then
    v_membership := active_membership(p_contact_id, v_local_date);

    if v_membership is null then
      raise exception 'NO_ACTIVE_PLAN';
    end if;

    select * into v_plan from plans where id = v_membership.plan_id;

    if not v_plan.allow_all_day then
      if v_weekday in (6, 7) and not v_plan.allow_weekends then
        raise exception 'WEEKEND_NOT_ALLOWED' using detail = json_build_object('plan', v_plan.name)::text;
      end if;

      select * into v_schedule
      from plan_schedules
      where plan_id = v_plan.id and weekday = v_weekday;

      if v_schedule is null then
        raise exception 'NO_SCHEDULE_FOR_DAY' using detail = json_build_object('plan', v_plan.name)::text;
      end if;

      if v_start_minute < v_schedule.start_minute or v_end_minute > v_schedule.end_minute then
        raise exception 'OUTSIDE_SCHEDULE_WINDOW' using detail = json_build_object(
          'plan', v_plan.name,
          'windowStart', lpad((v_schedule.start_minute / 60)::text, 2, '0') || ':' || lpad((v_schedule.start_minute % 60)::text, 2, '0'),
          'windowEnd', lpad((v_schedule.end_minute / 60)::text, 2, '0') || ':' || lpad((v_schedule.end_minute % 60)::text, 2, '0')
        )::text;
      end if;
    end if;

    v_quota_account_id := coalesce(v_quota_account_id, v_membership.quota_account_id);
    v_period := get_or_create_quota_period(v_quota_account_id, v_plan.monthly_minutes, v_local_date);

    select coalesce(sum(delta_minutes), 0) into v_balance
    from quota_movements
    where quota_period_id = v_period.id;

    if v_balance < v_minutes then
      raise exception 'INSUFFICIENT_QUOTA' using detail = json_build_object(
        'availableMinutes', v_balance,
        'neededMinutes', v_minutes
      )::text;
    end if;
  end if;

  begin
    insert into bookings (
      room_id, quota_account_id, contact_id, created_by,
      starts_at, ends_at, booking_type, consumes_quota, minutes_charged
    ) values (
      p_room_id,
      case when p_consumes_quota then v_quota_account_id else null end,
      p_contact_id,
      coalesce(p_created_by, p_contact_id),
      p_starts_at, p_ends_at, p_booking_type, p_consumes_quota,
      case when p_consumes_quota then v_minutes else null end
    )
    returning * into v_booking;
  exception when exclusion_violation then
    raise exception 'ROOM_OVERLAP';
  end;

  if p_consumes_quota then
    insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code, booking_id)
    values (v_quota_account_id, v_period.id, -v_minutes, 'booking', v_booking.id);
  end if;

  return v_booking;
end;
$$;

revoke execute on function create_booking_core(uuid, uuid, timestamptz, timestamptz, text, boolean, uuid, uuid)
  from public, anon, authenticated;

create or replace function create_booking(
  p_room_id uuid,
  p_contact_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_booking_type text default 'coworker',
  p_consumes_quota boolean default true,
  p_quota_account_id uuid default null,
  p_created_by uuid default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role() = 'service_role', false) or auth_is_admin() then
    return create_booking_core(
      p_room_id, p_contact_id, p_starts_at, p_ends_at,
      p_booking_type, p_consumes_quota, p_quota_account_id, p_created_by
    );
  end if;

  -- Everyone else: their own booking, spending their own plan's hours.
  return create_booking_core(p_room_id, p_contact_id, p_starts_at, p_ends_at);
end;
$$;

grant execute on function create_booking(uuid, uuid, timestamptz, timestamptz, text, boolean, uuid, uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. modify_booking
-- ---------------------------------------------------------------------------

create or replace function modify_booking(
  p_booking_id uuid,
  p_new_room_id uuid,
  p_new_starts_at timestamptz,
  p_new_ends_at timestamptz,
  p_actor_contact_id uuid default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old bookings;
  v_new bookings;
  v_actor uuid := p_actor_contact_id;
begin
  if not (coalesce(auth.role() = 'service_role', false) or auth_is_admin()) then
    v_actor := null;
  end if;

  select * into v_old from bookings where id = p_booking_id;

  if v_old is null then
    raise exception 'ORIGINAL_BOOKING_NOT_FOUND';
  end if;

  -- Checks the caller owns the booking (or is an admin).
  v_old := cancel_booking(p_booking_id, v_actor);

  -- Same terms as the original booking: who it's for, whose hours, type.
  v_new := create_booking_core(
    p_new_room_id,
    v_old.contact_id,
    p_new_starts_at,
    p_new_ends_at,
    v_old.booking_type,
    v_old.consumes_quota,
    v_old.quota_account_id,
    coalesce(v_actor, v_old.created_by)
  );

  update bookings
  set guest_name = v_old.guest_name, notes = v_old.notes
  where id = v_new.id
  returning * into v_new;

  insert into booking_changes (previous_booking_id, new_booking_id)
  values (v_old.id, v_new.id);

  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Internal event helpers: not callable through the API.
-- ---------------------------------------------------------------------------

revoke execute on function event_audience_contact_ids(uuid) from anon, authenticated;
revoke execute on function notify_event_audience(uuid) from anon, authenticated;
revoke execute on function notify_event_registered(uuid, text) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Upload limits. The app compresses every photo to a JPEG well under 1 MB.
-- ---------------------------------------------------------------------------

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id in ('packages', 'incidents', 'events');
