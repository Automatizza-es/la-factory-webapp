-- Core schema: contacts -> coworkers -> memberships -> plans -> quotas -> rooms -> bookings
-- Holded/Mailrelay/forms/access-control/billing layers are intentionally not modeled yet.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Contacts & companies
-- ---------------------------------------------------------------------------

create table contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text unique,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contacts_set_updated_at
  before update on contacts
  for each row execute function set_updated_at();

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- A contact with app login. Not every contact has one.
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  contact_id uuid not null unique references contacts (id) on delete cascade,
  role text not null default 'coworker' check (role in ('coworker', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Plans (tarifas) and their configurable booking windows
-- ---------------------------------------------------------------------------

create table plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  monthly_minutes integer not null check (monthly_minutes > 0),
  allow_all_day boolean not null default false,
  allow_weekends boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plans_set_updated_at
  before update on plans
  for each row execute function set_updated_at();

-- Allowed booking window per ISO weekday (1 = Monday .. 7 = Sunday) for a plan.
-- A plan with allow_all_day = true ignores this table. A plan with no rows here
-- has no allowed booking window at all -- intentional: we do not guess a
-- default schedule until the business rule is confirmed (see project notes on
-- Hot Desk weekday coverage).
create table plan_schedules (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_minute integer not null check (start_minute >= 0 and start_minute < 1440),
  end_minute integer not null check (end_minute > 0 and end_minute <= 1440),
  constraint plan_schedules_range check (end_minute > start_minute),
  unique (plan_id, weekday)
);

-- ---------------------------------------------------------------------------
-- Quota accounts: separate from membership so a future company account can
-- pool hours across several users without changing this shape.
-- ---------------------------------------------------------------------------

create table quota_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('contact', 'company')),
  contact_id uuid references contacts (id) on delete cascade,
  company_id uuid references companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint quota_accounts_owner_shape check (
    (owner_type = 'contact' and contact_id is not null and company_id is null) or
    (owner_type = 'company' and company_id is not null and contact_id is null)
  )
);

-- Users allowed to draw from a quota account (today: exactly the owner).
create table quota_account_members (
  id uuid primary key default gen_random_uuid(),
  quota_account_id uuid not null references quota_accounts (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (quota_account_id, contact_id)
);

-- Tarifa assigned to a contact over a period. Kept even after it ends, so
-- plan-change history survives.
create table memberships (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts (id) on delete cascade,
  plan_id uuid not null references plans (id),
  quota_account_id uuid not null references quota_accounts (id),
  status text not null default 'active' check (status in ('active', 'ended', 'cancelled')),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  constraint memberships_date_range check (end_date is null or end_date >= start_date)
);

create index memberships_contact_id_idx on memberships (contact_id);
create index memberships_quota_account_id_idx on memberships (quota_account_id);

-- One row per quota account per natural month: how many minutes it was
-- granted. Prorating rules for mid-month sign-ups are not decided yet, so
-- this table only records the outcome, not the rule.
create table quota_periods (
  id uuid primary key default gen_random_uuid(),
  quota_account_id uuid not null references quota_accounts (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  allocated_minutes integer not null check (allocated_minutes >= 0),
  created_at timestamptz not null default now(),
  unique (quota_account_id, period_start),
  constraint quota_periods_date_range check (period_end > period_start)
);

-- The ledger. Balance for a period = sum(delta_minutes) where
-- quota_period_id matches. Never store a bare "remaining minutes" field.
create table quota_movements (
  id uuid primary key default gen_random_uuid(),
  quota_account_id uuid not null references quota_accounts (id) on delete cascade,
  quota_period_id uuid not null references quota_periods (id) on delete cascade,
  delta_minutes integer not null check (delta_minutes <> 0),
  reason_code text not null check (
    reason_code in ('monthly_grant', 'booking', 'booking_cancellation', 'manual_adjustment')
  ),
  booking_id uuid,
  note text,
  created_by uuid references contacts (id),
  created_at timestamptz not null default now()
);

create index quota_movements_account_period_idx on quota_movements (quota_account_id, quota_period_id);

-- ---------------------------------------------------------------------------
-- Rooms & bookings
-- ---------------------------------------------------------------------------

create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  capacity_min smallint,
  capacity_max smallint,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id),
  quota_account_id uuid references quota_accounts (id),
  contact_id uuid references contacts (id),
  created_by uuid references contacts (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  booking_type text not null default 'coworker' check (
    booking_type in ('coworker', 'guest', 'contact', 'internal', 'event')
  ),
  consumes_quota boolean not null default true,
  minutes_charged integer,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_time_range check (ends_at > starts_at),
  constraint bookings_quota_shape check (
    (consumes_quota and quota_account_id is not null) or (not consumes_quota)
  ),
  -- The actual double-booking guard: two confirmed bookings for the same
  -- room can never have overlapping [starts_at, ends_at) ranges, enforced
  -- by Postgres itself so it holds even under concurrent requests.
  exclude using gist (
    room_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status = 'confirmed')
);

create trigger bookings_set_updated_at
  before update on bookings
  for each row execute function set_updated_at();

create index bookings_room_starts_idx on bookings (room_id, starts_at);
create index bookings_contact_id_idx on bookings (contact_id);

alter table quota_movements
  add constraint quota_movements_booking_id_fkey
  foreign key (booking_id) references bookings (id) on delete set null;

-- Traceability for the "modify = cancel + recreate" flow.
create table booking_changes (
  id uuid primary key default gen_random_uuid(),
  previous_booking_id uuid not null references bookings (id),
  new_booking_id uuid not null references bookings (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: deny by default, coworkers can read their own data.
-- Booking/quota mutations are not exposed to the client yet -- they will go
-- through a transactional RPC function once the reservation rules are final.
-- ---------------------------------------------------------------------------

alter table contacts enable row level security;
alter table users enable row level security;
alter table plans enable row level security;
alter table plan_schedules enable row level security;
alter table quota_accounts enable row level security;
alter table quota_account_members enable row level security;
alter table memberships enable row level security;
alter table quota_periods enable row level security;
alter table quota_movements enable row level security;
alter table rooms enable row level security;
alter table bookings enable row level security;

create or replace function auth_contact_id()
returns uuid
language sql
stable
as $$
  select contact_id from users where id = auth.uid();
$$;

create or replace function auth_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select role = 'admin' from users where id = auth.uid()), false);
$$;

create policy "contacts: self or admin" on contacts
  for select using (id = auth_contact_id() or auth_is_admin());

create policy "users: self or admin" on users
  for select using (id = auth.uid() or auth_is_admin());

create policy "plans: any authenticated user" on plans
  for select using (auth.role() = 'authenticated');

create policy "plan_schedules: any authenticated user" on plan_schedules
  for select using (auth.role() = 'authenticated');

create policy "rooms: any authenticated user" on rooms
  for select using (auth.role() = 'authenticated');

create policy "quota_accounts: member or admin" on quota_accounts
  for select using (
    auth_is_admin() or
    contact_id = auth_contact_id() or
    id in (select quota_account_id from quota_account_members where contact_id = auth_contact_id())
  );

create policy "quota_account_members: member or admin" on quota_account_members
  for select using (auth_is_admin() or contact_id = auth_contact_id());

create policy "memberships: self or admin" on memberships
  for select using (auth_is_admin() or contact_id = auth_contact_id());

create policy "quota_periods: member or admin" on quota_periods
  for select using (
    auth_is_admin() or
    quota_account_id in (
      select id from quota_accounts where contact_id = auth_contact_id()
      union
      select quota_account_id from quota_account_members where contact_id = auth_contact_id()
    )
  );

create policy "quota_movements: member or admin" on quota_movements
  for select using (
    auth_is_admin() or
    quota_account_id in (
      select id from quota_accounts where contact_id = auth_contact_id()
      union
      select quota_account_id from quota_account_members where contact_id = auth_contact_id()
    )
  );

create policy "bookings: own or admin" on bookings
  for select using (auth_is_admin() or contact_id = auth_contact_id());
