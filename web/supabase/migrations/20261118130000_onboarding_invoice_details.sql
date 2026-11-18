-- A separate invoice preference, independent of whether a membership is billable.
-- Existing users keep an unknown preference until they explicitly answer.
alter table public.contacts add column needs_invoice boolean;

create or replace function complete_coworker_onboarding(
  p_token text,
  p_first_name text,
  p_last_name text,
  p_nif text,
  p_company_name text,
  p_phone text,
  p_preferred_locale text,
  p_marketing_consent boolean,
  p_needs_invoice boolean,
  p_address text,
  p_city text,
  p_postal_code text,
  p_province text,
  p_country text
)
returns contacts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation coworker_invitations;
  v_contact contacts;
begin
  if auth_contact_id() is null then raise exception 'NOT_AUTHORIZED'; end if;
  select * into v_invitation
  from coworker_invitations
  where token = p_token
  for update;

  if v_invitation is null then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  if v_invitation.contact_id <> auth_contact_id() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if v_invitation.status = 'cancelled' then
    raise exception 'INVITATION_CANCELLED';
  end if;

  if v_invitation.status = 'completed' then
    raise exception 'INVITATION_ALREADY_COMPLETED';
  end if;

  if v_invitation.expires_at < now() then
    raise exception 'INVITATION_EXPIRED';
  end if;

  if p_first_name is null or length(trim(p_first_name)) = 0 then
    raise exception 'FIRST_NAME_REQUIRED';
  end if;

  if p_needs_invoice is null then raise exception 'INVOICE_CHOICE_REQUIRED'; end if;
  if p_needs_invoice and (
    coalesce(p_company_name, '') !~ '[^[:space:]]' or coalesce(p_nif, '') !~ '[^[:space:]]'
    or coalesce(p_address, '') !~ '[^[:space:]]' or coalesce(p_city, '') !~ '[^[:space:]]'
    or coalesce(p_postal_code, '') !~ '[^[:space:]]' or coalesce(p_province, '') !~ '[^[:space:]]'
    or coalesce(p_country, '') !~ '[^[:space:]]'
  ) then raise exception 'INVOICE_DETAILS_REQUIRED'; end if;
  if length(coalesce(p_address,'')) > 300 or length(coalesce(p_city,'')) > 100
    or length(coalesce(p_postal_code,'')) > 20 or length(coalesce(p_province,'')) > 100
    or length(coalesce(p_country,'')) > 100 then raise exception 'INVOICE_DETAILS_INVALID'; end if;
  if coalesce(trim(p_last_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'PROFILE_DETAILS_REQUIRED';
  end if;

  if p_preferred_locale is null or p_preferred_locale not in ('ca', 'es', 'en') then
    raise exception 'INVALID_LOCALE';
  end if;

  update contacts set
    first_name = trim(p_first_name),
    last_name = nullif(trim(coalesce(p_last_name, '')), ''),
    nif = coalesce(nullif(trim(p_nif), ''), nif),
    company_name = coalesce(nullif(trim(p_company_name), ''), company_name),
    needs_invoice = p_needs_invoice,
    address = coalesce(nullif(trim(p_address), ''), address),
    city = coalesce(nullif(trim(p_city), ''), city),
    postal_code = coalesce(nullif(trim(p_postal_code), ''), postal_code),
    province = coalesce(nullif(trim(p_province), ''), province),
    country = coalesce(nullif(trim(p_country), ''), country),
    phone = nullif(trim(coalesce(p_phone, '')), ''),
    preferred_locale = p_preferred_locale,
    marketing_consent = p_marketing_consent,
    marketing_consent_at = case when p_marketing_consent then now() else null end
  where id = v_invitation.contact_id
  returning * into v_contact;

  update coworker_invitations
  set status = 'completed', completed_at = now()
  where id = v_invitation.id;

  return v_contact;
end;
$$;

revoke all on function public.complete_coworker_onboarding(text,text,text,text,text,text,text,boolean,boolean,text,text,text,text,text) from public, anon;
grant execute on function public.complete_coworker_onboarding(text,text,text,text,text,text,text,boolean,boolean,text,text,text,text,text) to authenticated;

-- Older open registration forms must refresh to answer the new question.
-- Keeping this signature gives them a specific error and prevents bypassing validation.
create or replace function public.complete_coworker_onboarding(
  p_token text, p_first_name text, p_last_name text, p_nif text, p_company_name text,
  p_phone text, p_preferred_locale text, p_marketing_consent boolean
) returns public.contacts language plpgsql security definer set search_path = public as $$
begin
  if auth_contact_id() is null then raise exception 'NOT_AUTHORIZED'; end if;
  raise exception 'INVOICE_CHOICE_REQUIRED';
end;
$$;
revoke all on function public.complete_coworker_onboarding(text,text,text,text,text,text,text,boolean) from public, anon;
grant execute on function public.complete_coworker_onboarding(text,text,text,text,text,text,text,boolean) to authenticated;
