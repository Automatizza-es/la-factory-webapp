import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePill } from "@/components/calendar/DatePill";
import { DayCalendar } from "@/components/calendar/DayCalendar";
import { WeekCalendar } from "@/components/calendar/WeekCalendar";
import type { AppRole } from "@/components/layout/nav-items";
import {
  getAdminBookingPickers,
  getAdminOccupancy,
  getMinutesBookedByThisMonth,
} from "@/lib/data/admin";
import {
  getCurrentCoworker,
  getQuotaSummary,
  getRoomOccupancy,
  getRooms,
} from "@/lib/data/coworker";
import {
  formatDateLong,
  formatMinutesAsHours,
  formatWeekRangeLong,
  formatWeekRangePill,
} from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, startOfWeek, todayInMadrid, zonedDateTimeToUtcIso } from "@/lib/timezone";

interface CalendarScreenProps {
  role: AppRole;
  params: { fecha?: string; sala?: string; vista?: string };
}

// The day/week booking calendar, shared by both roles so admins book from
// the same screen as coworkers. Differences for admins: every booking shows
// who it's for and can be managed, new bookings ask "Reserva para", there's
// no quota, and the header shows the hours they've booked this month.
export async function CalendarScreen({ role, params }: CalendarScreenProps) {
  const { fecha, sala, vista } = params;
  const isAdmin = role === "admin";
  const basePath = isAdmin ? "/admin/calendario" : "/calendario";
  const date = fecha ?? todayInMadrid();
  const isWeekView = vista === "semana";

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const current = await getCurrentCoworker();
  if (!current) return null;
  // Guests (no plan right now) can't book.
  if (current.access === "guest") redirect("/");

  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  const rangeStart = zonedDateTimeToUtcIso(isWeekView ? weekStart : date, "00:00");
  const rangeEnd = zonedDateTimeToUtcIso(addDays(isWeekView ? weekEnd : date, 1), "00:00");

  const typeLabels = {
    event: dict.admin.createBooking.eventFallback,
    other: dict.admin.createBooking.otherFallback,
  };
  const [rooms, occupancy, quota, pickers, bookedMinutes] = await Promise.all([
    getRooms(supabase),
    isAdmin
      ? getAdminOccupancy(supabase, rangeStart, rangeEnd, typeLabels)
      : getRoomOccupancy(supabase, rangeStart, rangeEnd),
    isAdmin ? Promise.resolve(null) : getQuotaSummary(supabase, current.contactId, locale),
    isAdmin ? getAdminBookingPickers(supabase) : Promise.resolve(undefined),
    isAdmin ? getMinutesBookedByThisMonth(supabase, current.contactId) : Promise.resolve(0),
  ]);

  const initialRoomId = sala && rooms.some((r) => r.id === sala) ? sala : undefined;
  const activeRoomId = initialRoomId ?? rooms[0]?.id;
  const salaQuery = initialRoomId ? `&sala=${initialRoomId}` : "";
  const dayHref = `${basePath}?fecha=${date}${salaQuery}`;
  const weekHref = `${basePath}?fecha=${date}&vista=semana${activeRoomId ? `&sala=${activeRoomId}` : ""}`;

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.calendar.title}</h1>
          <p className="text-sm text-warm-gray">
            {isWeekView ? formatWeekRangeLong(weekStart, weekEnd, locale) : formatDateLong(date, locale)}
          </p>
          {isAdmin && (
            <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-brown-dark shadow-sm">
              {dict.admin.createBooking.bookedThisMonth(formatMinutesAsHours(bookedMinutes))}
            </p>
          )}
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
            href={`${basePath}?fecha=${addDays(weekStart, -7)}&vista=semana${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <DatePill
            date={date}
            locale={locale}
            extraQuery={`&vista=semana${salaQuery}`}
            basePath={basePath}
            label={formatWeekRangePill(weekStart, weekEnd, locale)}
          />
          <Link
            href={`${basePath}?fecha=${addDays(weekStart, 7)}&vista=semana${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}?fecha=${addDays(date, -1)}${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <DatePill date={date} locale={locale} extraQuery={salaQuery} basePath={basePath} />
          <Link
            href={`${basePath}?fecha=${addDays(date, 1)}${salaQuery}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <Link
            href={`${basePath}?fecha=${todayInMadrid()}${salaQuery}`}
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
              locale={locale}
              myName={current.coworker.firstName}
              basePath={basePath}
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
            myName={current.coworker.firstName}
            basePath={basePath}
            admin={pickers}
          />
        )}
      </div>
    </div>
  );
}
