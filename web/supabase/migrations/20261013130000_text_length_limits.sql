-- Length limits on text people type themselves (same numbers as
-- src/lib/limits.ts, where the forms stop at them). Without them, a direct
-- API call could store a name or description of any size.
-- NOT VALID: existing rows aren't checked, only new and updated ones.

alter table contacts
  add constraint contacts_first_name_length check (length(first_name) <= 100) not valid,
  add constraint contacts_last_name_length check (length(last_name) <= 100) not valid,
  add constraint contacts_company_name_length check (length(company_name) <= 150) not valid,
  add constraint contacts_phone_length check (length(phone) <= 30) not valid,
  add constraint contacts_nif_length check (length(nif) <= 20) not valid;

alter table incidents
  add constraint incidents_description_length check (length(description) <= 2000) not valid;

alter table packages
  add constraint packages_note_length check (length(note) <= 500) not valid;
