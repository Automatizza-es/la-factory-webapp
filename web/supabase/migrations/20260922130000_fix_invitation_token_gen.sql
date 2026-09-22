-- pgcrypto's functions live in the `extensions` schema on this project, not
-- `public` -- gen_random_uuid() worked everywhere else because table column
-- defaults don't pin search_path the way `set search_path = public` on a
-- SECURITY DEFINER function does. Schema-qualify the one call that needs it.

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
    encode(extensions.gen_random_bytes(32), 'hex'),
    now() + interval '14 days',
    auth_contact_id()
  )
  returning * into v_invitation;

  return v_invitation;
end;
$$;
