import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

export const runtime = "nodejs";

interface BookingReminderPayload {
  contactId: string;
  bookingId: string;
  roomName: string;
  startsAt: string;
  endsAt: string;
}

// Called only by our own pg_net trigger inside process_booking_reminders()
// (Supabase), never by the browser -- gated by a shared secret since it's
// otherwise an unauthenticated endpoint capable of pushing to a device.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.PUSH_CRON_SECRET}`;
  if (!process.env.PUSH_CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as BookingReminderPayload;
  const { contactId, bookingId, roomName, startsAt, endsAt } = payload;

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("contact_id", contactId);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: contact } = await supabase
    .from("contacts")
    .select("preferred_locale")
    .eq("id", contactId)
    .maybeSingle();

  const locale: Locale =
    contact?.preferred_locale === "ca" || contact?.preferred_locale === "en"
      ? contact.preferred_locale
      : "es";
  const dict = getDictionary(locale);

  const startZoned = utcIsoToZonedDateAndMinutes(startsAt);
  const endZoned = utcIsoToZonedDateAndMinutes(endsAt);
  const timeRange = `${minutesToTime(startZoned.minutes)}–${minutesToTime(endZoned.minutes)}`;

  const title = dict.notifications.bookingReminderTitle;
  const body = dict.notifications.bookingReminderBody(roomName, timeRange);
  const url = `/reservas#reserva-${bookingId}`;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title, body, url }),
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }),
  );

  return NextResponse.json({ sent });
}
