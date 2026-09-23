import Image from "next/image";
import Link from "next/link";
import { PartyPopper, Plus } from "lucide-react";
import { CancelEventButton } from "@/components/admin/CancelEventButton";
import { getAdminEvents } from "@/lib/data/events";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

export default async function AdminEventsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const events = await getAdminEvents(supabase);

  function formatWhen(iso: string) {
    const zoned = utcIsoToZonedDateAndMinutes(iso);
    return `${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.admin.events.title}</h1>
          <p className="text-sm text-warm-gray">{dict.admin.events.subtitle}</p>
        </div>
        <Link
          href="/admin/eventos/new"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {dict.admin.events.newEvent}
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
          {dict.admin.events.noEvents}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/50">
                {ev.imageUrl ? (
                  <Image src={ev.imageUrl} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PartyPopper className="h-5 w-5 text-warm-gray" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{ev.title}</p>
                <p className="text-xs text-warm-gray">{formatWhen(ev.startsAt)}</p>
                <Link
                  href={`/admin/eventos/${ev.id}/asistentes`}
                  className="text-xs font-medium text-brown-dark underline"
                >
                  {dict.admin.events.attendeesLabel(ev.registeredCount)}
                  {ev.capacity ? ` / ${ev.capacity}` : ` (${dict.admin.events.unlimitedCapacity})`}
                </Link>
              </div>
              {ev.status === "cancelled" ? (
                <span className="shrink-0 rounded-full bg-sand/50 px-2.5 py-1 text-xs font-medium text-warm-gray">
                  {dict.admin.events.statusCancelled}
                </span>
              ) : (
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Link
                    href={`/admin/eventos/${ev.id}/editar`}
                    className="rounded-lg bg-cream px-3 py-1.5 text-center text-xs font-medium text-brown-dark"
                  >
                    {dict.admin.events.edit}
                  </Link>
                  <CancelEventButton
                    eventId={ev.id}
                    label={dict.admin.events.cancelEvent}
                    confirmLabel={dict.admin.events.cancelConfirm}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
