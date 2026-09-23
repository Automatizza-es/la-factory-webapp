import Image from "next/image";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import type { EventItem } from "@/lib/data/events";
import { formatDateLong, minutesToTime } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface EventCardProps {
  event: EventItem;
  dict: Dictionary["events"];
  locale: Locale;
}

export function EventCard({ event, dict, locale }: EventCardProps) {
  const zoned = utcIsoToZonedDateAndMinutes(event.startsAt);
  const whenLabel = `${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`;
  const isFull = event.capacity !== null && event.registeredCount >= event.capacity && !event.isRegistered;

  let statusLabel: string;
  let statusClass: string;
  if (event.status === "cancelled") {
    statusLabel = dict.full;
    statusClass = "bg-sand/50 text-warm-gray";
  } else if (event.isRegistered) {
    statusLabel = dict.joined;
    statusClass = "bg-emerald-50 text-emerald-700";
  } else if (isFull) {
    statusLabel = dict.full;
    statusClass = "bg-sand/50 text-warm-gray";
  } else {
    statusLabel = dict.join;
    statusClass = "bg-cream text-brown-dark";
  }

  return (
    <Link
      href={`/eventos/${event.id}`}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/50">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PartyPopper className="h-5 w-5 text-warm-gray" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{event.title}</p>
        <p className="text-xs text-warm-gray">{whenLabel}</p>
        {event.location && <p className="truncate text-xs text-warm-gray">{event.location}</p>}
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
        {statusLabel}
      </span>
    </Link>
  );
}
