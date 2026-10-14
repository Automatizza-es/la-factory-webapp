-- "Cambiar tarifa" in the person file. Until now a plan in force could only
-- be ended, and a new one assigned once it had ended, so going from Hot Desk
-- to Fixed meant waiting a day, and correcting a wrong plan from its start
-- date was impossible.
--
-- admin_change_plan(contact, new plan, from):
-- - from on or before the current plan's start date: a correction, the
--   current membership simply gets the new plan;
-- - later: the current one ends the day before and the new one starts that
--   day, on the same quota account (shared members keep drawing from it).
-- Either way, if the change reaches into this month (Madrid), this month's
-- hours become the new plan's: the period's allocation is updated and the
-- difference added as a grant, so bookings already made still count.

create or replace function admin_change_plan(
  p_contact_id uuid,
  p_plan_id uuid,
  p_from date
)
returns memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_month_start date := date_trunc('month', v_today)::date;
  v_month_end date := (date_trunc('month', v_today) + interval '1 month' - interval '1 day')::date;
  v_current memberships;
  v_new memberships;
  v_plan plans;
  v_period quota_periods;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_plan from plans where id = p_plan_id and is_active;
  if v_plan.id is null then
    raise exception 'PLAN_NOT_FOUND';
  end if;

  select * into v_current
  from memberships
  where contact_id = p_contact_id
    and status = 'active'
    and start_date <= v_today
    and (end_date is null or end_date >= v_today)
  order by start_date desc
  limit 1
  for update;
  if v_current.id is null then
    raise exception 'NO_ACTIVE_PLAN';
  end if;
  if v_current.plan_id = p_plan_id then
    raise exception 'SAME_PLAN';
  end if;

  if p_from <= v_current.start_date then
    update memberships set plan_id = p_plan_id where id = v_current.id returning * into v_new;
  else
    update memberships set end_date = p_from - 1 where id = v_current.id;
    insert into memberships (contact_id, plan_id, quota_account_id, status, start_date, end_date, billable)
    values (p_contact_id, p_plan_id, v_current.quota_account_id, 'active', p_from, v_current.end_date, v_current.billable)
    returning * into v_new;
  end if;

  -- This month's hours follow the new plan when the change reaches into it.
  if p_from <= v_month_end then
    select * into v_period
    from quota_periods
    where quota_account_id = v_current.quota_account_id and period_start = v_month_start
    for update;

    if v_period.id is not null and v_period.allocated_minutes <> v_plan.monthly_minutes then
      insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code, note, created_by)
      values (
        v_current.quota_account_id,
        v_period.id,
        v_plan.monthly_minutes - v_period.allocated_minutes,
        'monthly_grant',
        'Cambio de tarifa',
        auth_contact_id()
      );
      update quota_periods set allocated_minutes = v_plan.monthly_minutes where id = v_period.id;
    end if;
  end if;

  return v_new;
end;
$$;

revoke execute on function admin_change_plan(uuid, uuid, date) from public, anon;
grant execute on function admin_change_plan(uuid, uuid, date) to authenticated;
