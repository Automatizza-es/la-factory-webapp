-- Shared plans ("caso Anabella"): someone with no plan of their own can be
-- authorised on another person's quota account (quota_account_members) and
-- then books like a coworker, drawing from that same pool of hours. The
-- owner keeps the membership and is the one billed.
--
-- Plus: people manage their own newsletter consent (contacts.marketing_consent).

-- Members of a shared account may read the membership that feeds it (the
-- quota_periods / quota_movements policies already let them read the rest).
create policy "memberships: shared quota members" on memberships
  for select using (
    quota_account_id in (
      select quota_account_id from quota_account_members where contact_id = auth_contact_id()
    )
  );

grant select, insert, update, delete on quota_account_members to service_role;
-- The admin person file assigns plans (new quota account + membership).
grant select, insert, update, delete on quota_accounts to service_role;

-- ---------------------------------------------------------------------------
-- active_membership: the contact's own plan in force on that date or, if
-- they have none, the plan of an account they're authorised on. Used by
-- create_booking, so shared members book against the shared hours.
-- ---------------------------------------------------------------------------

create or replace function active_membership(p_contact_id uuid, p_on_date date)
returns memberships
language plpgsql
stable
as $$
declare
  v memberships;
begin
  select * into v
  from memberships
  where contact_id = p_contact_id
    and status = 'active'
    and start_date <= p_on_date
    and (end_date is null or end_date >= p_on_date)
  order by start_date desc
  limit 1;

  if v.id is null then
    select m.* into v
    from memberships m
    join quota_account_members qam on qam.quota_account_id = m.quota_account_id
    where qam.contact_id = p_contact_id
      and m.status = 'active'
      and m.start_date <= p_on_date
      and (m.end_date is null or m.end_date >= p_on_date)
    order by m.start_date desc
    limit 1;
  end if;

  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- effective_membership: what the app uses to show someone's plan and hours
-- (own or shared), for themselves or for an admin.
-- ---------------------------------------------------------------------------

create or replace function effective_membership(p_contact_id uuid)
returns memberships
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (auth_is_admin() or auth_contact_id() = p_contact_id) then
    raise exception 'NOT_AUTHORIZED';
  end if;
  return active_membership(p_contact_id, (now() at time zone 'Europe/Madrid')::date);
end;
$$;

grant execute on function effective_membership(uuid) to authenticated;

-- Coworkers directory now includes people booking on a shared plan.
create or replace function get_active_coworkers_directory()
returns table (id uuid, first_name text, last_name text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.first_name, c.last_name
  from contacts c
  where c.status = 'active'
    and (active_membership(c.id, (now() at time zone 'Europe/Madrid')::date)).id is not null;
$$;

-- ---------------------------------------------------------------------------
-- set_my_newsletter: the person's own newsletter opt-in / opt-out.
-- ---------------------------------------------------------------------------

create or replace function set_my_newsletter(p_subscribed boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update contacts
  set marketing_consent = p_subscribed,
      marketing_consent_at = case when p_subscribed then now() else marketing_consent_at end
  where id = auth_contact_id();
end;
$$;

grant execute on function set_my_newsletter(boolean) to authenticated;
