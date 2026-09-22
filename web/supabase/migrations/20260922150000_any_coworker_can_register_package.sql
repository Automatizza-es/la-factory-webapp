-- Any signed-in coworker can register a package now, not just admin/staff:
-- in a small space, whoever happens to be there when a delivery arrives is
-- the one who takes the photo. Renamed from admin_register_package since
-- that name is no longer accurate. Marking a package collected stays
-- admin-only (that wasn't asked for, and is a different trust level).

drop function if exists admin_register_package(uuid, text, text);

create or replace function register_package(
  p_recipient_contact_id uuid,
  p_image_path text,
  p_note text
)
returns packages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_package packages;
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists (select 1 from contacts where id = p_recipient_contact_id) then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  insert into packages (recipient_contact_id, image_path, note, received_by)
  values (p_recipient_contact_id, p_image_path, nullif(trim(coalesce(p_note, '')), ''), auth_contact_id())
  returning * into v_package;

  insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
  values (
    p_recipient_contact_id,
    'package_received',
    'PACKAGE_RECEIVED_TITLE',
    'PACKAGE_RECEIVED_BODY',
    '/paquetes',
    v_package.id
  );

  return v_package;
end;
$$;

grant execute on function register_package(uuid, text, text) to authenticated;

-- Any signed-in coworker can upload a package photo now too.
drop policy "packages storage: admin can insert" on storage.objects;

create policy "packages storage: signed-in user can insert" on storage.objects
  for insert with check (bucket_id = 'packages' and auth_contact_id() is not null);

-- ---------------------------------------------------------------------------
-- get_active_coworkers_directory: memberships/contacts RLS only lets a
-- coworker see their own row (by design, it carries email/phone/quota).
-- Picking a package recipient needs a name-only directory of everyone
-- active, so expose just that much through a SECURITY DEFINER function
-- instead of loosening the real RLS.
-- ---------------------------------------------------------------------------

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
  where m.status = 'active';
$$;

grant execute on function get_active_coworkers_directory() to authenticated;
