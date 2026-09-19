import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePill } from "@/components/calendar/DatePill";
import { DayCalendar } from "@/components/calendar/DayCalendar";
import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import {
  getCurrentCoworker,
  getQuotaSummary,
  getRoomOccupancy,
  getRooms,
} from "@/lib/data/coworker";
import { formatDateLong, formatWeekRangeLong, formatWeekRangePill } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, startOfWeek, todayInMadrid, zonedDateTimeToUtcIso } from "@/lib/timezone";

interface CalendarioPageProps {
  searchParams: Promise<{ fecha?: string; sala?: string; vista?: string }>;
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
  const { fecha, sala, vista } = await searchParams;
  const date = fecha ?? todayInMadrid();
  const isWeekView = vista === "semana";

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const current = await getCurrentCoworker();
  if (!current) return null;

  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  const rangeStart = zonedDateTimeToUtcIso(isWeekView ? weekStart : date, "00:00");
  const rangeEnd = zonedDateTimeToUtcIso(addDays(isWeekView ? weekEnd : date, 1), "00:00");

  const [rooms, occupancy, quota] = await Promise.all([
    getRooms(supabase),
    getRoomOccupancy(supabase, rangeStart, rangeEnd),
    getQuotaSummary(supabase, current.contactId, locale),
  ]);

  const initialRoomId = sala && rooms.some((r) => r.id === sala) ? sala : undefined;
  const activeRoomId = initialRoomId ?? rooms[0]?.id;
  const salaQuery = initialRoomId ? `&sala=${initialRoomId}` : "";
  const dayHref = `/calendario?fecha=${date}${salaQuery}`;
  const weekHref = `/calendario?fecha=${date}&vista=semana${activeRoomId ? `&sala=${activeRoomId}` : ""}`;

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.calendar.title}</h1>
          <p className="text-sm text-warm-gray">
            {isWeekView ? formatWeekRangeLong(weekStart, weekEnd, locale) : formatDateLong(date, locale)}
          </p>
        </div>
        <div className="flex shrink-0 rounded-full bg-white p-1 shadow-sm">
          <Link
            href={dayHref}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              isWeekView ? "text-warm-gray" : "bg-brown-dark text-white"
            }`}
          >
            {dict.calendar.day}
          </Link>
          <Link
            href={weekHref}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              isWeekView ? "bg-brown-dark text-white" : "text-warm-gray"
            }`}
          >
            {dict.calendar.week}
          </Link>
        </div>
      </div>

      {isWeekView ? (
        <div className="flex items-center gap-2">
          <Link
            href={`/calendario?fecha=${addDays(weekStart, -7)}&vista=semana${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <DatePill
            date={date}
            locale={locale}
            extraQuery={`&vista=semana${salaQuery}`}
            label={formatWeekRangePill(weekStart, weekEnd, locale)}
          />
          <Link
            href={`/calendario?fecha=${addDays(weekStart, 7)}&vista=semana${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href={`/calendario?fecha=${addDays(date, -1)}${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <DatePill date={date} locale={locale} extraQuery={salaQuery} />
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
      )}

      <div className="rounded-3xl bg-white p-4 shadow-sm">
        {isWeekView ? (
          activeRoomId && (
            <WeekCalendar
              weekDates={weekDates}
              rooms={rooms}
              activeRoomId={activeRoomId}
              occupancy={occupancy}
              dict={dict.calendar}
              bookingDict={dict.booking}
              locale={locale}
            />
          )
        ) : (
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
        )}
      </div>
    </div>
  );
}
