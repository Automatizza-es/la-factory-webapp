-- Point booking-reminder push calls at the production domain instead of the
-- original vercel.app URL. Same function body, only the URL changes.

create or replace function process_booking_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_secret text;
  v_wants_reminder boolean;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_cron_secret';

  for v_booking in
    select b.id, b.contact_id, b.starts_at, b.ends_at, r.name as room_name
    from bookings b
    join rooms r on r.id = b.room_id
    where b.status = 'confirmed'
      and b.contact_id is not null
      and b.reminder_sent_at is null
      and b.starts_at > now()
      and b.starts_at <= now() + interval '60 minutes'
    for update of b skip locked
  loop
    update bookings set reminder_sent_at = now() where id = v_booking.id;

    select coalesce(
      (select booking_reminders from notification_preferences where contact_id = v_booking.contact_id),
      true
    ) into v_wants_reminder;

    if v_wants_reminder then
      insert into notifications (recipient_contact_id, type, title, body, link_path, related_id)
      values (
        v_booking.contact_id,
        'booking_reminder',
        'BOOKING_REMINDER_TITLE',
        'BOOKING_REMINDER_BODY',
        '/reservas#reserva-' || v_booking.id,
        v_booking.id
      );

      if v_secret is not null then
        perform net.http_post(
          url := 'https://hub.lafactorycoworking.com/api/push/send',
          headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secret),
          body := jsonb_build_object(
            'contactId', v_booking.contact_id,
            'bookingId', v_booking.id,
            'roomName', v_booking.room_name,
            'startsAt', v_booking.starts_at,
            'endsAt', v_booking.ends_at
          )
        );
      end if;
    end if;
  end loop;
end;
$$;
