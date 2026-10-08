import { NextResponse, type NextRequest } from "next/server";
import { minutesToTime } from "@/lib/format";
import { sendPushToContact } from "@/lib/push-server";
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

  const sent = await sendPushToContact(contactId, (dict) => {
    const startZoned = utcIsoToZonedDateAndMinutes(startsAt);
    const endZoned = utcIsoToZonedDateAndMinutes(endsAt);
    const timeRange = `${minutesToTime(startZoned.minutes)}–${minutesToTime(endZoned.minutes)}`;
    return {
      title: dict.notifications.bookingReminderTitle,
      body: dict.notifications.bookingReminderBody(roomName, timeRange),
      url: `/reservas#reserva-${bookingId}`,
    };
  });

  return NextResponse.json({ sent });
}
