-- service_role has no implicit access to tables it didn't create -- same
-- gotcha hit earlier with coworker_invitations/contacts. Grant it here so
-- server-side/admin tooling can read and manage events directly.
grant select, insert, update, delete on events, event_audience_contacts, event_registrations to service_role;
