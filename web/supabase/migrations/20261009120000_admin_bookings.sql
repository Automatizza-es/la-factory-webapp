-- Admin bookings "for" someone: a coworker, an external client (free-text
-- name, no account), a guest contact, an event or something else, with
-- optional notes. Admins book from the same calendar as coworkers.

alter table bookings
  add column guest_name text,
  add column notes text;

alter table bookings drop constraint bookings_booking_type_check;
alter table bookings add constraint bookings_booking_type_check check (
  booking_type in ('coworker', 'guest', 'contact', 'internal', 'event', 'external', 'other')
);

-- ---------------------------------------------------------------------------
-- admin_create_booking: create_booking (which already lets admins book
-- without quota and for anyone) plus the admin-only guest name / notes.
-- ---------------------------------------------------------------------------

create or replace function admin_create_booking(
  p_room_id uuid,
  p_contact_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_booking_type text,
  p_consumes_quota boolean,
  p_guest_name text default null,
  p_notes text default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  if not auth_is_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  v_booking := create_booking(
    p_room_id,
    p_contact_id,
    p_starts_at,
    p_ends_at,
    p_booking_type,
    p_consumes_quota,
    null,
    auth_contact_id()
  );

  update bookings
  set guest_name = nullif(trim(p_guest_name), ''), notes = nullif(trim(p_notes), '')
  where id = v_booking.id
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function admin_create_booking(uuid, uuid, timestamptz, timestamptz, text, boolean, text, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- modify_booking: same as before (cancel + recreate), but the new booking
-- keeps the old one's guest name and notes.
-- ---------------------------------------------------------------------------

create or replace function modify_booking(
  p_booking_id uuid,
  p_new_room_id uuid,
  p_new_starts_at timestamptz,
  p_new_ends_at timestamptz,
  p_actor_contact_id uuid default null
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old bookings;
  v_new bookings;
begin
  select * into v_old from bookings where id = p_booking_id;

  if v_old is null then
    raise exception 'ORIGINAL_BOOKING_NOT_FOUND';
  end if;

  v_old := cancel_booking(p_booking_id, p_actor_contact_id);

  v_new := create_booking(
    p_new_room_id,
    v_old.contact_id,
    p_new_starts_at,
    p_new_ends_at,
    v_old.booking_type,
    v_old.consumes_quota,
    v_old.quota_account_id,
    coalesce(p_actor_contact_id, v_old.created_by)
  );

  update bookings
  set guest_name = v_old.guest_name, notes = v_old.notes
  where id = v_new.id
  returning * into v_new;

  insert into booking_changes (previous_booking_id, new_booking_id)
  values (v_old.id, v_new.id);

  return v_new;
end;
$$;
