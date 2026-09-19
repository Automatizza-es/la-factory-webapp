import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { DayCalendar } from "@/components/calendar/DayCalendar";
import {
  getCurrentCoworker,
  getQuotaSummary,
  getRoomOccupancy,
  getRooms,
} from "@/lib/data/coworker";
import { formatDateLong, formatDatePill } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayInMadrid, zonedDateTimeToUtcIso } from "@/lib/timezone";

interface CalendarioPageProps {
  searchParams: Promise<{ fecha?: string; sala?: string }>;
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
  const { fecha, sala } = await searchParams;
  const date = fecha ?? todayInMadrid();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const current = await getCurrentCoworker();
  if (!current) return null;

  const rangeStart = zonedDateTimeToUtcIso(date, "00:00");
  const rangeEnd = zonedDateTimeToUtcIso(addDays(date, 1), "00:00");

  const [rooms, occupancy, quota] = await Promise.all([
    getRooms(supabase),
    getRoomOccupancy(supabase, rangeStart, rangeEnd),
    getQuotaSummary(supabase, current.contactId, locale),
  ]);

  const initialRoomId = sala && rooms.some((r) => r.id === sala) ? sala : undefined;
  const salaQuery = initialRoomId ? `&sala=${initialRoomId}` : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.calendar.title}</h1>
          <p className="text-sm text-warm-gray">{formatDateLong(date, locale)}</p>
        </div>
        <div className="flex shrink-0 rounded-full bg-white p-1 shadow-sm">
          <span className="rounded-full bg-brown-dark px-3 py-1.5 text-sm font-medium text-white">
            {dict.calendar.day}
          </span>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full px-3 py-1.5 text-sm font-medium text-warm-gray/70"
          >
            {dict.calendar.week}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/calendario?fecha=${addDays(date, -1)}${salaQuery}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
        </Link>
        <div className="flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-full bg-white px-2.5 py-2 shadow-sm">
          <Calendar className="h-4 w-4 shrink-0 text-brown-dark" strokeWidth={2} />
          <span className="truncate whitespace-nowrap text-sm font-medium text-ink">
            {formatDatePill(date, locale)}
          </span>
        </div>
        <Link
          href={`/calendario?fecha=${addDays(date, 1)}${salaQuery}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
        </Link>
        <Link
          href={`/calendario?fecha=${todayInMadrid()}${salaQuery}`}
          className="shrink-0 rounded-full bg-white px-3 py-2 text-sm font-medium text-warm-gray shadow-sm"
        >
          {dict.calendar.today}
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <DayCalendar
          date={date}
          rooms={rooms}
          occupancy={occupancy}
          quota={quota}
          dict={dict.calendar}
          bookingDict={dict.booking}
          roomDict={dict.room}
          reservarDict={dict.reservar}
          roomOverlapText={dict.errors.roomOverlap}
          locale={locale}
          initialRoomId={initialRoomId}
        />
      </div>
    </div>
  );
}
