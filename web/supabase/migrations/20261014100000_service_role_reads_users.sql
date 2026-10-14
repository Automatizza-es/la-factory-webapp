-- The app's server-side (service key) code reads users to know who has a
-- login, but service_role was never granted SELECT on it (it bypasses RLS,
-- not the table privilege). Those reads failed quietly and came back empty:
-- the package recipient list showed nobody, announcements found no
-- recipients, new-incident push never reached admins, and changing the
-- email of someone with a login didn't change their login email.

grant select on users to service_role;
