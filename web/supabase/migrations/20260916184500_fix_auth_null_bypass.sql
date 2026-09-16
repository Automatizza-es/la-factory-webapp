-- Security fix: in SQL's three-valued logic, `false OR NULL` is NULL, not
-- false, and `IF NULL THEN ... END IF` in plpgsql does not execute the
-- branch. So when auth.role() and auth_contact_id() are both NULL (no JWT
-- claims at all in the session), the previous
-- `if not (auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = p_contact_id)`
-- check evaluated to `if not null`, which is skipped -- silently allowing
-- the call instead of rejecting it. Wrap the whole condition in
-- coalesce(..., false) so any uncertainty fails closed (denies) instead of
-- failing open.

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
  v_window_label text;
begin
  if not coalesce(
    auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = p_contact_id,
    false
  ) then
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
        v_window_label := lpad((v_schedule.start_minute / 60)::text, 2, '0') || ':' ||
          lpad((v_schedule.start_minute % 60)::text, 2, '0') || '-' ||
          lpad((v_schedule.end_minute / 60)::text, 2, '0') || ':' ||
          lpad((v_schedule.end_minute % 60)::text, 2, '0');

        raise exception 'La tarifa % solo permite reservar entre % ese día.', v_plan.name, v_window_label;
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

  if not coalesce(
    auth.role() = 'service_role' or auth_is_admin() or auth_contact_id() = v_booking.contact_id,
    false
  ) then
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
