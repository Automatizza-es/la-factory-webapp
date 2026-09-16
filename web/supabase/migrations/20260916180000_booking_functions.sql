-- Transactional booking logic. Each mutating function runs as a single
-- Postgres transaction so the overlap check, schedule check, quota check
-- and quota deduction/refund are all-or-nothing, even under concurrent
-- requests from different coworkers.

create index quota_movements_booking_id_idx on quota_movements (booking_id) where booking_id is not null;

-- Internal helper: not exposed to authenticated/anon, only callable from
-- the security definer functions below.
create or replace function active_membership(p_contact_id uuid, p_on_date date)
returns memberships
language sql
stable
as $$
  select *
  from memberships
  where contact_id = p_contact_id
    and status = 'active'
    and start_date <= p_on_date
    and (end_date is null or end_date >= p_on_date)
  order by start_date desc
  limit 1;
$$;

-- Internal helper: gets this month's quota_periods row for the account,
-- creating it (and its monthly_grant movement) on first use. No proration
-- for accounts created mid-month -- they get the full monthly_minutes,
-- per the confirmed project decision.
create or replace function get_or_create_quota_period(
  p_quota_account_id uuid,
  p_allocated_minutes integer,
  p_for_date date
)
returns quota_periods
language plpgsql
as $$
declare
  v_period quota_periods;
  v_period_start date := date_trunc('month', p_for_date)::date;
  v_period_end date := (date_trunc('month', p_for_date) + interval '1 month' - interval '1 day')::date;
begin
  begin
    insert into quota_periods (quota_account_id, period_start, period_end, allocated_minutes)
    values (p_quota_account_id, v_period_start, v_period_end, p_allocated_minutes)
    returning * into v_period;

    insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code)
    values (p_quota_account_id, v_period.id, p_allocated_minutes, 'monthly_grant');
  exception when unique_violation then
    select * into v_period
    from quota_periods
    where quota_account_id = p_quota_account_id and period_start = v_period_start
    for update;
  end;

  return v_period;
end;
$$;

revoke execute on function active_membership(uuid, date) from public;
revoke execute on function get_or_create_quota_period(uuid, integer, date) from public;

-- ---------------------------------------------------------------------------
-- create_booking
-- ---------------------------------------------------------------------------

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
  if not (auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = p_contact_id) then
    raise exception 'No autorizado para reservar en nombre de este contacto.';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'La hora de fin debe ser posterior a la de inicio.';
  end if;

  if p_starts_at <= now() then
    raise exception 'La reserva debe empezar en el futuro.';
  end if;

  if v_local_date <> v_local_end::date then
    raise exception 'La reserva debe empezar y terminar el mismo día.';
  end if;

  v_end_minute := v_start_minute + v_minutes;

  if not exists (select 1 from rooms where id = p_room_id and is_active) then
    raise exception 'La sala no está disponible.';
  end if;

  if p_consumes_quota then
    v_membership := active_membership(p_contact_id, v_local_date);

    if v_membership is null then
      raise exception 'No hay una tarifa activa para este coworker en esa fecha.';
    end if;

    select * into v_plan from plans where id = v_membership.plan_id;

    if not v_plan.allow_all_day then
      if v_weekday in (6, 7) and not v_plan.allow_weekends then
        raise exception 'La tarifa % no permite reservar en fin de semana.', v_plan.name;
      end if;

      select * into v_schedule
      from plan_schedules
      where plan_id = v_plan.id and weekday = v_weekday;

      if v_schedule is null then
        raise exception 'La tarifa % no tiene horario habilitado ese día.', v_plan.name;
      end if;

      if v_start_minute < v_schedule.start_minute or v_end_minute > v_schedule.end_minute then
        raise exception 'La tarifa % solo permite reservar entre las %s:%s y las %s:%s ese día.',
          v_plan.name,
          lpad((v_schedule.start_minute / 60)::text, 2, '0'), lpad((v_schedule.start_minute % 60)::text, 2, '0'),
          lpad((v_schedule.end_minute / 60)::text, 2, '0'), lpad((v_schedule.end_minute % 60)::text, 2, '0');
      end if;
    end if;

    v_quota_account_id := coalesce(v_quota_account_id, v_membership.quota_account_id);
    v_period := get_or_create_quota_period(v_quota_account_id, v_plan.monthly_minutes, v_local_date);

    select coalesce(sum(delta_minutes), 0) into v_balance
    from quota_movements
    where quota_period_id = v_period.id;

    if v_balance < v_minutes then
      raise exception 'Cuota insuficiente: quedan % min disponibles y la reserva necesita % min.', v_balance, v_minutes;
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
    raise exception 'Ya existe otra reserva para esta sala en ese horario.';
  end;

  if p_consumes_quota then
    insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code, booking_id)
    values (v_quota_account_id, v_period.id, -v_minutes, 'booking', v_booking.id);
  end if;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------------
-- cancel_booking
-- ---------------------------------------------------------------------------

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
    raise exception 'La reserva no existe.';
  end if;

  if not (auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = v_booking.contact_id) then
    raise exception 'No autorizado para cancelar esta reserva.';
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'La reserva ya está cancelada.';
  end if;

  if v_booking.starts_at <= now() then
    raise exception 'No se puede cancelar una reserva que ya ha empezado.';
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

-- ---------------------------------------------------------------------------
-- modify_booking: cancel + recreate in one transaction, traced via
-- booking_changes. If the new slot is invalid, everything rolls back and
-- the original booking is left untouched.
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
begin
  select * into v_old from bookings where id = p_booking_id;

  if v_old is null then
    raise exception 'La reserva original no existe.';
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

grant execute on function create_booking(uuid, uuid, timestamptz, timestamptz, text, boolean, uuid, uuid) to authenticated;
grant execute on function cancel_booking(uuid, uuid) to authenticated;
grant execute on function modify_booking(uuid, uuid, timestamptz, timestamptz, uuid) to authenticated;
