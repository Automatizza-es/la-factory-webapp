import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayCalendar } from "@/components/calendar/DayCalendar";
import {
  getCurrentCoworker,
  getQuotaSummary,
  getRoomOccupancy,
  getRooms,
} from "@/lib/data/coworker";
import { formatDateLong } from "@/lib/format";
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

  const isToday = date === todayInMadrid();
  const initialRoomId = sala && rooms.some((r) => r.id === sala) ? sala : undefined;
  const salaQuery = initialRoomId ? `&sala=${initialRoomId}` : "";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.calendar.title}</h1>
        <p className="text-sm text-warm-gray">{formatDateLong(date, locale)}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/calendario?fecha=${addDays(date, -1)}${salaQuery}`}
          className="rounded-lg bg-white p-2 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
        </Link>
        <Link
          href={`/calendario?fecha=${todayInMadrid()}${salaQuery}`}
          className={`rounded-lg px-3 py-2 text-sm font-medium shadow-sm ${
            isToday ? "bg-brown-dark text-white" : "bg-white text-warm-gray"
          }`}
        >
          {dict.calendar.today}
        </Link>
        <Link
          href={`/calendario?fecha=${addDays(date, 1)}${salaQuery}`}
          className="rounded-lg bg-white p-2 shadow-sm"
        >
          <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
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
