-- Welcome invitations for coworkers who already exist (imported, so we
-- already have their details): same token/expiry/resend/cancel machinery as
-- onboarding invitations, but the link skips the onboarding form and goes
-- straight to "create your password". `kind` tells the two apart.

alter table coworker_invitations
  add column kind text not null default 'onboarding'
    check (kind in ('onboarding', 'welcome'));

-- ---------------------------------------------------------------------------
-- admin_create_welcome_invitations: one welcome invitation per contact that
-- has no login yet and no live (pending, unexpired) invitation. Contacts
-- that don't qualify are skipped, so the "send to everyone" button is safe
-- to press twice. Returns the invitations it created.
-- ---------------------------------------------------------------------------

create or replace function admin_create_welcome_invitations(p_contact_ids uuid[])
returns setof coworker_invitations
language plpgsql
security definer
set search_path = public
as $$
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  return query
  insert into coworker_invitations (contact_id, token, expires_at, created_by, kind)
  select
    c.id,
    encode(extensions.gen_random_bytes(32), 'hex'),
    now() + interval '14 days',
    auth_contact_id(),
    'welcome'
  from contacts c
  where c.id = any (p_contact_ids)
    and c.email is not null
    and not exists (select 1 from users u where u.contact_id = c.id)
    and not exists (
      select 1 from coworker_invitations i
      where i.contact_id = c.id and i.status = 'pending' and i.expires_at > now()
    )
  returning *;
end;
$$;

-- ---------------------------------------------------------------------------
-- complete_my_welcome_invitation: called once the coworker has set their
-- password, so the admin list flips them to "active".
-- ---------------------------------------------------------------------------

create or replace function complete_my_welcome_invitation()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update coworker_invitations
  set status = 'completed', completed_at = now()
  where contact_id = auth_contact_id() and kind = 'welcome' and status = 'pending';
end;
$$;

grant execute on function admin_create_welcome_invitations(uuid[]) to authenticated;
grant execute on function complete_my_welcome_invitation() to authenticated;
