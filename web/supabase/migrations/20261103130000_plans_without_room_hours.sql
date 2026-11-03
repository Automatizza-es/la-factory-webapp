-- Community memberships may include no room hours. Keep them as real plans
-- instead of assigning Fixed/Hot Desk hours to Day Pass, Croissant, etc.
alter table plans drop constraint plans_monthly_minutes_check;
alter table plans add constraint plans_monthly_minutes_check check (monthly_minutes >= 0);

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

    -- The ledger deliberately forbids zero-value movements.
    if p_allocated_minutes <> 0 then
      insert into quota_movements (quota_account_id, quota_period_id, delta_minutes, reason_code)
      values (p_quota_account_id, v_period.id, p_allocated_minutes, 'monthly_grant');
    end if;
  exception when unique_violation then
    select * into v_period
    from quota_periods
    where quota_account_id = p_quota_account_id and period_start = v_period_start
    for update;
  end;

  return v_period;
end;
$$;

insert into plans (code, name, monthly_minutes, allow_all_day, allow_weekends)
values
  ('private_office', 'Private Office', 0, false, false),
  ('domicilio', 'Domicilio', 0, false, false),
  ('day_pass', 'Day Pass', 0, false, false),
  ('five_day_pass', '5 Day Pass', 0, false, false),
  ('meeting_room', 'Meeting Room', 0, false, false),
  ('croissant', 'Croissant', 0, false, false)
on conflict (code) do nothing;
