-- The /invite/[token] route reads this table directly with the service-role
-- key (before the visitor has any session to authenticate an RPC call with).
-- service_role bypasses RLS but still needs the base table GRANT -- same
-- gotcha as 20260916193000, just for service_role instead of authenticated.

grant select on coworker_invitations to service_role;
