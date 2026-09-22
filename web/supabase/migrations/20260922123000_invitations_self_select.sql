-- The invited coworker needs to read their own invitation row (to render
-- the onboarding page), not just admins.

drop policy "coworker_invitations: admin only" on coworker_invitations;

create policy "coworker_invitations: own or admin" on coworker_invitations
  for select using (auth_is_admin() or contact_id = auth_contact_id());

-- Same GRANT-vs-RLS gotcha as 20260916193000: the policy alone does nothing
-- without this.
grant select on coworker_invitations to authenticated;
