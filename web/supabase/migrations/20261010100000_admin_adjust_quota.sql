-- "Administración podrá añadir horas": an admin adds (or removes, with a
-- negative amount) hours on someone's pool for the current month, with an
-- optional note. Goes into the same ledger as everything else, as a
-- 'manual_adjustment' movement, so balances and booking checks pick it up.

create or replace function admin_adjust_quota(
  p_contact_id uuid,
  p_delta_minutes integer,
  p_note text default null
)
returns quota_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_membership memberships;
  v_plan plans;
  v_period quota_periods;
  v_movement quota_movements;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if coalesce(p_delta_minutes, 0) = 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Own plan or the one they share: the hours go to that pool.
  v_membership := active_membership(p_contact_id, v_today);
  if v_membership.id is null then
    raise exception 'NO_ACTIVE_PLAN';
  end if;

  select * into v_plan from plans where id = v_membership.plan_id;
  v_period := get_or_create_quota_period(v_membership.quota_account_id, v_plan.monthly_minutes, v_today);

  insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code, note, created_by)
  values (
    v_membership.quota_account_id,
    v_period.id,
    p_delta_minutes,
    'manual_adjustment',
    nullif(trim(p_note), ''),
    auth_contact_id()
  )
  returning * into v_movement;

  return v_movement;
end;
$$;

grant execute on function admin_adjust_quota(uuid, integer, text) to authenticated;
