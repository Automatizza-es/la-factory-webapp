-- Lets any signed-in coworker see room occupancy (for the calendar view)
-- without exposing whose booking it is -- only whether it's their own.
-- The `bookings` RLS policy restricts a regular coworker to their own
-- rows, which is correct for "my bookings" but too strict for "is this
-- room free right now", a legitimately shared/public-within-the-org
-- question. SECURITY DEFINER bypasses that RLS deliberately and only for
-- this narrow, non-identifying shape.

create or replace function get_room_occupancy(p_range_start timestamptz, p_range_end timestamptz)
returns table (
  id uuid,
  room_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  is_mine boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select b.id, b.room_id, b.starts_at, b.ends_at, (b.contact_id = auth_contact_id()) as is_mine
  from bookings b
  where b.status = 'confirmed'
    and b.starts_at < p_range_end
    and b.ends_at > p_range_start
  order by b.starts_at;
$$;

revoke execute on function get_room_occupancy(timestamptz, timestamptz) from public;
grant execute on function get_room_occupancy(timestamptz, timestamptz) to authenticated;
