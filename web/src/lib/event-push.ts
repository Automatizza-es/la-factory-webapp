import { createClient as createServiceClient } from "@supabase/supabase-js";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { sendPushToContact } from "@/lib/push-server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

export type EventNotificationType = "event_new" | "event_changed" | "event_cancelled" | "event_reminder";

// The database creates event notifications (it knows the audience and who's
// registered); this sends the matching push to the same people: everyone
// who got a notification of `type` for this event since `sinceIso`.
export async function pushEventNotifications(eventId: string, type: EventNotificationType, sinceIso: string) {
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const [{ data: rows }, { data: event }] = await Promise.all([
    admin
      .from("notifications")
      .select("recipient_contact_id")
      .eq("related_id", eventId)
      .eq("type", type)
      .gte("created_at", sinceIso),
    admin.from("events").select("title, starts_at").eq("id", eventId).single(),
  ]);
  if (!event || !rows?.length) return;

  const zoned = utcIsoToZonedDateAndMinutes(event.starts_at);
  await Promise.all(
    rows.map((r) =>
      sendPushToContact(r.recipient_contact_id as string, (d, locale) => {
        const when = `${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`;
        const n = d.notifications;
        const message =
          type === "event_new"
            ? { title: n.eventNewTitle, body: n.eventNewBody(event.title, when) }
            : type === "event_changed"
              ? { title: n.eventChangedTitle, body: n.eventChangedBody(event.title, when) }
              : type === "event_cancelled"
                ? { title: n.eventCancelledTitle, body: n.eventCancelledBody(event.title) }
                : { title: n.eventReminderTitle, body: n.eventReminderBody(event.title, when) };
        return { ...message, url: `/eventos/${eventId}` };
      }),
    ),
  );
}

// A moment before calling the RPC, with a little margin for clock drift
// between the app and the database.
export function pushWindowStart(): string {
  return new Date(Date.now() - 5000).toISOString();
}
