-- Calendar readers can see who a confirmed booking is for, without gaining
-- access to contact records or permission to change other people's bookings.
-- The return shape changes, so PostgreSQL requires recreating the function.
drop function get_room_occupancy(timestamptz, timestamptz);

create function get_room_occupancy(p_range_start timestamptz, p_range_end timestamptz)
returns table (
  id uuid,
  room_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  is_mine boolean,
  label text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.id,
    b.room_id,
    b.starts_at,
    b.ends_at,
    coalesce(b.contact_id = auth_contact_id(), false),
    coalesce(
      nullif(trim(concat_ws(' ', c.first_name, c.last_name)), ''),
      nullif(trim(b.guest_name), '')
    )
  from bookings b
  left join contacts c on c.id = b.contact_id
  where auth_contact_id() is not null
    and b.status = 'confirmed'
    and b.starts_at < p_range_end
    and b.ends_at > p_range_start
  order by b.starts_at;
$$;

revoke execute on function get_room_occupancy(timestamptz, timestamptz) from public, anon;
grant execute on function get_room_occupancy(timestamptz, timestamptz) to authenticated;
