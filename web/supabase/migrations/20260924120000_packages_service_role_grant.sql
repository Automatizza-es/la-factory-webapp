-- Same service_role gotcha as events/notifications/coworker_invitations
-- before it.
grant select, insert, update, delete on packages to service_role;
