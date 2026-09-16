-- RLS policies only take effect after the base table-level privilege check
-- passes. These tables had SELECT policies but no GRANT SELECT for the
-- authenticated role, so every read from the app (via PostgREST, which
-- really does switch Postgres role per request) failed with "permission
-- denied for table X" even though the policy itself would have allowed it.
-- (Testing via `supabase db query`/the CLI connects as the postgres
-- superuser regardless of any JWT claim faked with `set local
-- request.jwt.claims`, which is why this was missed earlier.)

grant select on
  contacts,
  users,
  plans,
  plan_schedules,
  quota_accounts,
  quota_account_members,
  memberships,
  quota_periods,
  quota_movements,
  rooms,
  bookings
to authenticated;
