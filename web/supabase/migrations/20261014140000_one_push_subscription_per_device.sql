-- Someone got the same push twice: they had two subscriptions on the same
-- phone (e.g. one from the browser and one from the installed app, or an
-- old one that was never removed), and each got a copy. When a device
-- subscribes, drop that person's other subscriptions from the same browser
-- (same user agent), and clear the duplicates already stored.

create or replace function save_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth_contact_id() is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  delete from push_subscriptions
  where contact_id = auth_contact_id()
    and user_agent = p_user_agent
    and endpoint <> p_endpoint;

  insert into push_subscriptions (contact_id, endpoint, p256dh, auth, user_agent)
  values (auth_contact_id(), p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (endpoint) do update set
    contact_id = excluded.contact_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent;
end;
$$;

-- Existing duplicates: keep the newest subscription per person and browser.
delete from push_subscriptions ps
using push_subscriptions newer
where newer.contact_id = ps.contact_id
  and newer.user_agent = ps.user_agent
  and newer.created_at > ps.created_at;
