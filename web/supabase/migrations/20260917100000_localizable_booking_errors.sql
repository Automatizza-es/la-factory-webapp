-- Replace natural-language Spanish error messages with stable error codes
-- (in `message`) plus structured parameters (as JSON in `detail`), so the
-- app can translate them per the viewer's locale instead of always
-- surfacing Spanish text from the database.

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

create or replace function cancel_booking(
  p_booking_id uuid,
  p_actor_contact_id uuid default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
  v_period_id uuid;
begin
  select * into v_booking from bookings where id = p_booking_id for update;

  if v_booking is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if not coalesce(
    auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = v_booking.contact_id,
    false
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'ALREADY_CANCELLED';
  end if;

  if v_booking.starts_at <= now() then
    raise exception 'ALREADY_STARTED';
  end if;

  update bookings
  set status = 'cancelled', cancelled_at = now()
  where id = p_booking_id
  returning * into v_booking;

  if v_booking.consumes_quota then
    select quota_period_id into v_period_id
    from quota_movements
    where booking_id = p_booking_id and reason_code = 'booking'
    limit 1;

    insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code, booking_id)
    values (v_booking.quota_account_id, v_period_id, v_booking.minutes_charged, 'booking_cancellation', p_booking_id);
  end if;

  return v_booking;
end;
$$;

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
begin
  select * into v_old from bookings where id = p_booking_id;

  if v_old is null then
    raise exception 'ORIGINAL_BOOKING_NOT_FOUND';
  end if;

  v_old := cancel_booking(p_booking_id, p_actor_contact_id);

  v_new := create_booking(
    p_new_room_id,
    v_old.contact_id,
    p_new_starts_at,
    p_new_ends_at,
    v_old.booking_type,
    v_old.consumes_quota,
    v_old.quota_account_id,
    coalesce(p_actor_contact_id, v_old.created_by)
  );

  insert into booking_changes (previous_booking_id, new_booking_id)
  values (v_old.id, v_new.id);

  return v_new;
end;
$$;
