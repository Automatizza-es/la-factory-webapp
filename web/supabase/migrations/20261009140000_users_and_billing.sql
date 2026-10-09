-- Users, roles and billing, per the functional plan: identity, access,
-- membership, billing and "can receive packages" are independent concepts.
--
-- - Coworker vs Invitado is derived (active membership or not), not stored.
-- - Archived contacts keep their data/history but drop out of operations
--   and can't use the app.
-- - Billing: whether each membership period is billable, who receives the
--   invoice (the person or a company), fiscal details, the plan's price,
--   and a per-month "invoiced" mark the admin ticks as she bills in Holded.

-- ---------------------------------------------------------------------------
-- Companies: billing entities a coworker's invoice can go to
-- ---------------------------------------------------------------------------

alter table companies
  add column tax_id text,
  add column address text,
  add column city text,
  add column postal_code text,
  add column province text,
  add column country text,
  add column billing_email text,
  add column holded_contact_id text,
  add column notes text,
  add column updated_at timestamptz not null default now();

create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

-- Fiscal data: admins only (writes go through the service key after an
-- admin check in the app).
alter table companies enable row level security;

create policy "companies: admin only" on companies
  for select using (auth_is_admin());

grant select on companies to authenticated;

-- ---------------------------------------------------------------------------
-- Contacts: status, packages permission, fiscal address, billing entity,
-- Holded link and internal notes
-- ---------------------------------------------------------------------------

alter table contacts
  add column status text not null default 'active' check (status in ('active', 'archived')),
  add column archived_at timestamptz,
  add column can_receive_packages boolean not null default true,
  add column address text,
  add column city text,
  add column postal_code text,
  add column province text,
  add column country text,
  -- null = the person is billed themselves.
  add column billing_company_id uuid references companies (id) on delete set null,
  add column holded_contact_id text,
  add column internal_notes text;

-- ---------------------------------------------------------------------------
-- Plans: informative monthly price. Memberships: billable per period.
-- ---------------------------------------------------------------------------

alter table plans add column monthly_price numeric(10, 2);

alter table memberships add column billable boolean not null default true;

-- ---------------------------------------------------------------------------
-- billing_marks: "invoiced in Holded" tick, one per membership per month
-- ---------------------------------------------------------------------------

create table billing_marks (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references memberships (id) on delete cascade,
  period_month date not null check (extract(day from period_month) = 1),
  invoiced_at timestamptz not null default now(),
  invoiced_by uuid references contacts (id),
  unique (membership_id, period_month)
);

alter table billing_marks enable row level security;

create policy "billing_marks: admin only" on billing_marks
  for select using (auth_is_admin());

grant select on billing_marks to authenticated;
grant select, insert, update, delete on billing_marks to service_role;
grant select, insert, update, delete on companies to service_role;
grant select, insert, update, delete on contacts to service_role;
grant select, insert, update, delete on memberships to service_role;
grant select, insert, update, delete on plans to service_role;

-- ---------------------------------------------------------------------------
-- update_my_profile: the signed-in person edits their own basic details.
-- Email is deliberately not editable here (it's their login).
-- ---------------------------------------------------------------------------

create or replace function update_my_profile(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_company_name text,
  p_preferred_locale text
)
returns contacts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact contacts;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;
  if coalesce(trim(p_first_name), '') = '' then
    raise exception 'FIRST_NAME_REQUIRED';
  end if;

  update contacts
  set first_name = trim(p_first_name),
      last_name = nullif(trim(p_last_name), ''),
      phone = nullif(trim(p_phone), ''),
      company_name = nullif(trim(p_company_name), ''),
      preferred_locale = case when p_preferred_locale in ('ca', 'es', 'en') then p_preferred_locale else preferred_locale end
  where id = auth_contact_id()
  returning * into v_contact;

  return v_contact;
end;
$$;

grant execute on function update_my_profile(text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Package recipients no longer depend on having a plan: anyone active who
-- is allowed to receive packages (coworkers, guests, former coworkers...).
-- Name-only, same reasoning as get_active_coworkers_directory.
-- ---------------------------------------------------------------------------

create or replace function get_package_recipients_directory()
returns table (id uuid, first_name text, last_name text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.first_name, c.last_name
  from contacts c
  where c.status = 'active'
    and c.can_receive_packages
    and coalesce(trim(c.first_name), '') <> '';
$$;

grant execute on function get_package_recipients_directory() to authenticated;

-- Coworkers directory (used to pick who a booking is for): only people with
-- a plan in force today, and never archived ones.
create or replace function get_active_coworkers_directory()
returns table (id uuid, first_name text, last_name text)
language sql
security definer
set search_path = public
stable
as $$
  select distinct c.id, c.first_name, c.last_name
  from contacts c
  join memberships m on m.contact_id = c.id
  where m.status = 'active'
    and m.start_date <= current_date
    and (m.end_date is null or m.end_date >= current_date)
    and c.status = 'active';
$$;
