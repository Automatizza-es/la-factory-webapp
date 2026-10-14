-- A reporter got the same incident update twice, 5 seconds apart: the admin's
-- Save went through twice with the same status and note. Saving what's
-- already stored now changes nothing and tells nobody (NO_CHANGE).

create or replace function admin_update_incident(
  p_incident_id uuid,
  p_status text,
  p_note text default null
)
returns incidents
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before incidents;
  v_incident incidents;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_before from incidents where id = p_incident_id for update;
  if v_before is null then
    raise exception 'INCIDENT_NOT_FOUND';
  end if;

  if v_before.status = p_status
     and coalesce(v_before.admin_note, '') = coalesce(nullif(trim(p_note), ''), '') then
    raise exception 'NO_CHANGE';
  end if;

  update incidents
  set status = p_status,
      admin_note = nullif(trim(p_note), ''),
      resolved_at = case when p_status = 'resolved' then coalesce(resolved_at, now()) else null end
  where id = p_incident_id
  returning * into v_incident;

  if v_incident.reporter_contact_id <> auth_contact_id() then
    insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
    values (
      v_incident.reporter_contact_id,
      'incident_update',
      'INCIDENT_UPDATE_TITLE',
      'INCIDENT_UPDATE_BODY',
      '/incidencias',
      v_incident.id
    );
  end if;

  return v_incident;
end;
$$;
