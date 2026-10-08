-- Daily housekeeping: package photos are deleted 30 days after pickup and
-- notifications 30 days after they're created. Files can only be removed
-- through the Storage API, so the actual work happens in /api/cleanup on the
-- app; this migration lets a package outlive its photo and schedules the
-- nightly call, authenticated with the same vault secret as push reminders.

alter table packages alter column image_path drop not null;

create or replace function trigger_daily_cleanup()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_cron_secret';
  if v_secret is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://hub.lafactorycoworking.com/api/cleanup',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$$;

-- Only pg_cron (running as the owner) should ever call this.
revoke execute on function trigger_daily_cleanup() from public, anon, authenticated;

-- 03:00 UTC = 04:00/05:00 in Madrid, when nobody is using the app.
select cron.schedule('daily-cleanup', '0 3 * * *', $$select trigger_daily_cleanup();$$);
