-- Reports are private to the reporter and active administrators, including
-- pending/in-progress reports. No incident data or history is deleted.
drop policy if exists "incidents: own, open or admin" on public.incidents;

create policy "incidents: reporter or admin" on public.incidents
  for select to authenticated
  using (
    public.auth_is_admin()
    or reporter_contact_id = public.auth_contact_id()
  );
