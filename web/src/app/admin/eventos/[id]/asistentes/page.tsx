import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getEventAttendees } from "@/lib/data/events";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface AdminEventAttendeesPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventAttendeesPage({ params }: AdminEventAttendeesPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const [{ data: event }, attendees] = await Promise.all([
    supabase.from("events").select("title").eq("id", id).maybeSingle(),
    getEventAttendees(supabase, id),
  ]);

  const registered = attendees.filter((a) => a.status === "registered");
  const cancelled = attendees.filter((a) => a.status === "cancelled");

  function formatWhen(iso: string) {
    const zoned = utcIsoToZonedDateAndMinutes(iso);
    return `${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/eventos" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.admin.eventAttendees.back}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.eventAttendees.title}</h1>
        {event?.title && <p className="text-sm text-warm-gray">{event.title}</p>}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {dict.admin.eventAttendees.registered} ({registered.length})
        </h2>
        {registered.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
            {dict.admin.eventAttendees.noAttendees}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {registered.map((a) => (
              <div key={a.contactId} className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm">
                <span className="text-sm font-medium text-ink">{a.name}</span>
                <span className="text-xs text-warm-gray">{formatWhen(a.registeredAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {cancelled.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">
            {dict.admin.eventAttendees.cancelled} ({cancelled.length})
          </h2>
          <div className="flex flex-col gap-2">
            {cancelled.map((a) => (
              <div key={a.contactId} className="flex items-center justify-between rounded-2xl bg-white p-3.5 opacity-60 shadow-sm">
                <span className="text-sm font-medium text-ink">{a.name}</span>
                <span className="text-xs text-warm-gray">
                  {a.cancelledAt ? formatWhen(a.cancelledAt) : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
