-- Coworker onboarding: admin creates a bare contact + membership from just
-- an email/plan/start date, sends them a personal invitation link, and the
-- coworker fills in the rest of their own profile before getting real
-- access. Keeps the same separation the rest of the schema already has:
-- contacts (person), users (auth link), memberships (tarifa) stay
-- untouched in shape -- onboarding state lives in its own table instead of
-- growing any of those.

alter table contacts
  add column if not exists nif text,
  add column if not exists company_name text,
  add column if not exists preferred_locale text not null default 'es'
    check (preferred_locale in ('ca', 'es', 'en')),
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

-- ---------------------------------------------------------------------------
-- Invitations: one row is both "the invite" (token, expiry, resend/cancel)
-- and the onboarding status for that contact. A contact can have more than
-- one over time (e.g. a cancelled one followed by a fresh invite), so the
-- current state is always "the most recent row for this contact".
-- ---------------------------------------------------------------------------

create table coworker_invitations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts (id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  expires_at timestamptz not null,
  sent_at timestamptz,
  created_by uuid references contacts (id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index coworker_invitations_contact_id_idx on coworker_invitations (contact_id);
create unique index coworker_invitations_token_idx on coworker_invitations (token);

alter table coworker_invitations enable row level security;

create policy "coworker_invitations: admin only" on coworker_invitations
  for select using (auth_is_admin());

-- ---------------------------------------------------------------------------
-- admin_create_coworker_invitation: the "+ Nuevo coworker" action. Creates
-- the contact, its quota account and membership (plan + start date, exactly
-- as the admin chose -- the coworker never picks these), and a fresh
-- invitation. Returns the invitation row so the caller has the token to
-- build the link/send the email.
-- ---------------------------------------------------------------------------

create or replace function admin_create_coworker_invitation(
  p_email text,
  p_plan_code text,
  p_start_date date
)
returns coworker_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact contacts;
  v_plan plans;
  v_quota_account_id uuid;
  v_invitation coworker_invitations;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if exists (select 1 from contacts where email = p_email) then
    raise exception 'EMAIL_ALREADY_EXISTS';
  end if;

  select * into v_plan from plans where code = p_plan_code and is_active;
  if v_plan is null then
    raise exception 'PLAN_NOT_FOUND';
  end if;

  insert into contacts (first_name, email)
  values ('', p_email)
  returning * into v_contact;

  insert into quota_accounts (owner_type, contact_id)
  values ('contact', v_contact.id)
  returning id into v_quota_account_id;

  insert into memberships (contact_id, plan_id, quota_account_id, status, start_date)
  values (v_contact.id, v_plan.id, v_quota_account_id, 'active', p_start_date);

  insert into coworker_invitations (contact_id, token, expires_at, created_by)
  values (
    v_contact.id,
    encode(gen_random_bytes(32), 'hex'),
    now() + interval '14 days',
    auth_contact_id()
  )
  returning * into v_invitation;

  return v_invitation;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_resend_coworker_invitation / admin_cancel_coworker_invitation
-- ---------------------------------------------------------------------------

create or replace function admin_resend_coworker_invitation(p_invitation_id uuid)
returns coworker_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation coworker_invitations;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update coworker_invitations
  set expires_at = now() + interval '14 days'
  where id = p_invitation_id and status = 'pending'
  returning * into v_invitation;

  if v_invitation is null then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  return v_invitation;
end;
$$;

create or replace function admin_cancel_coworker_invitation(p_invitation_id uuid)
returns coworker_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation coworker_invitations;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update coworker_invitations
  set status = 'cancelled'
  where id = p_invitation_id and status = 'pending'
  returning * into v_invitation;

  if v_invitation is null then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  return v_invitation;
end;
$$;

create or replace function admin_mark_invitation_sent(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  update coworker_invitations set sent_at = now() where id = p_invitation_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- complete_coworker_onboarding: called by the invited coworker themselves,
-- once they're signed in via their invite link. Validates the token still
-- belongs to *this* signed-in contact and is still usable, fills in their
-- profile, and closes out the invitation.
-- ---------------------------------------------------------------------------

create or replace function complete_coworker_onboarding(
  p_token text,
  p_first_name text,
  p_last_name text,
  p_nif text,
  p_company_name text,
  p_phone text,
  p_preferred_locale text,
  p_marketing_consent boolean
)
returns contacts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation coworker_invitations;
  v_contact contacts;
begin
  select * into v_invitation
  from coworker_invitations
  where token = p_token
  for update;

  if v_invitation is null then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  if v_invitation.contact_id <> auth_contact_id() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_invitation.status = 'cancelled' then
    raise exception 'INVITATION_CANCELLED';
  end if;

  if v_invitation.status = 'completed' then
    raise exception 'INVITATION_ALREADY_COMPLETED';
  end if;

  if v_invitation.expires_at < now() then
    raise exception 'INVITATION_EXPIRED';
  end if;

  if p_first_name is null or length(trim(p_first_name)) = 0 then
    raise exception 'FIRST_NAME_REQUIRED';
  end if;

  if p_preferred_locale not in ('ca', 'es', 'en') then
    raise exception 'INVALID_LOCALE';
  end if;

  update contacts set
    first_name = trim(p_first_name),
    last_name = nullif(trim(coalesce(p_last_name, '')), ''),
    nif = nullif(trim(coalesce(p_nif, '')), ''),
    company_name = nullif(trim(coalesce(p_company_name, '')), ''),
    phone = nullif(trim(coalesce(p_phone, '')), ''),
    preferred_locale = p_preferred_locale,
    marketing_consent = p_marketing_consent,
    marketing_consent_at = case when p_marketing_consent then now() else null end
  where id = v_invitation.contact_id
  returning * into v_contact;

  update coworker_invitations
  set status = 'completed', completed_at = now()
  where id = v_invitation.id;

  return v_contact;
end;
$$;

grant execute on function admin_create_coworker_invitation(text, text, date) to authenticated;
grant execute on function admin_resend_coworker_invitation(uuid) to authenticated;
grant execute on function admin_cancel_coworker_invitation(uuid) to authenticated;
grant execute on function admin_mark_invitation_sent(uuid) to authenticated;
grant execute on function complete_coworker_onboarding(text, text, text, text, text, text, text, boolean) to authenticated;
