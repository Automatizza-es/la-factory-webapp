import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, PartyPopper, Users } from "lucide-react";
import { EventRegisterButton } from "@/components/events/EventRegisterButton";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getEventDetail } from "@/lib/data/events";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const current = await getCurrentCoworker();
  if (!current) return null;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const event = await getEventDetail(supabase, current.contactId, id);

  if (!event) notFound();

  const startZoned = utcIsoToZonedDateAndMinutes(event.startsAt);
  const endZoned = utcIsoToZonedDateAndMinutes(event.endsAt);
  const dateLabel = formatDateLong(startZoned.date, locale);
  const timeLabel = `${minutesToTime(startZoned.minutes)}–${minutesToTime(endZoned.minutes)}`;

  const isFull = event.capacity !== null && event.registeredCount >= event.capacity && !event.isRegistered;
  const now = new Date();
  const isClosed =
    (event.registrationDeadline !== null && new Date(event.registrationDeadline) < now) ||
    new Date(event.endsAt) < now;

  const spotsLeftLabel =
    event.capacity !== null
      ? event.capacity - event.registeredCount === 1
        ? dict.events.spotsLeftOne
        : dict.events.spotsLeft(Math.max(event.capacity - event.registeredCount, 0))
      : null;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/eventos" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.events.back}
      </Link>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="relative h-48 w-full bg-sand/50">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PartyPopper className="h-10 w-10 text-warm-gray" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <h1 className="text-xl font-bold text-ink">{event.title}</h1>
            <p className="mt-1 text-sm text-warm-gray">
              {dateLabel} · {timeLabel}
            </p>
          </div>

          {event.description && <p className="text-sm text-ink">{event.description}</p>}

          <div className="flex flex-col gap-2 rounded-2xl bg-cream p-4 text-sm">
            {event.location && (
              <div className="flex items-center gap-2 text-ink">
                <MapPin className="h-4 w-4 shrink-0 text-brown-dark" strokeWidth={2} />
                {event.location}
              </div>
            )}
            {event.capacity !== null && (
              <div className="flex items-center gap-2 text-ink">
                <Users className="h-4 w-4 shrink-0 text-brown-dark" strokeWidth={2} />
                {spotsLeftLabel}
              </div>
            )}
          </div>

          {event.status === "published" && (
            <EventRegisterButton
              eventId={event.id}
              isRegistered={event.isRegistered}
              isFull={isFull}
              isClosed={isClosed}
              isCancelled={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
