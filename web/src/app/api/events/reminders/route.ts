import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { pushEventNotifications, pushWindowStart } from "@/lib/event-push";
import { zonedDateTimeToUtcIso, addDays, todayInMadrid } from "@/lib/timezone";

export const runtime = "nodejs";

// Day-before reminders, called each morning by the event-reminders pg_cron
// job (same shared secret as /api/push/send and /api/cleanup). For every
// published event starting tomorrow (Madrid) that hasn't had its reminder:
// notify the people registered (in-app + push) and mark it as sent.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.PUSH_CRON_SECRET || authHeader !== `Bearer ${process.env.PUSH_CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const tomorrow = addDays(todayInMadrid(), 1);
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("status", "published")
    .is("reminder_sent_at", null)
    .gte("starts_at", zonedDateTimeToUtcIso(tomorrow, "00:00"))
    .lt("starts_at", zonedDateTimeToUtcIso(addDays(tomorrow, 1), "00:00"));

  let reminded = 0;
  for (const event of events ?? []) {
    const { data: registrations } = await supabase
      .from("event_registrations")
      .select("contact_id")
      .eq("event_id", event.id)
      .eq("status", "registered");

    const since = pushWindowStart();
    if (registrations?.length) {
      await supabase.from("notifications").insert(
        registrations.map((r) => ({
          recipient_contact_id: r.contact_id,
          type: "event_reminder",
          title: "EVENT_REMINDER",
          body: "EVENT_REMINDER",
          link_path: `/eventos/${event.id}`,
          related_id: event.id,
        })),
      );
      await pushEventNotifications(event.id, "event_reminder", since);
      reminded += registrations.length;
    }
    await supabase.from("events").update({ reminder_sent_at: new Date().toISOString() }).eq("id", event.id);
  }

  return NextResponse.json({ events: events?.length ?? 0, reminded });
}
