import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarRoomFilter } from "@/components/admin/CalendarRoomFilter";
import { getAllRooms, getBookingsInLocalRange, type AdminBooking } from "@/lib/data/admin";
import { addDays, addMonths, monthGridWeeks, startOfWeek } from "@/lib/calendar-utils";
import {
  formatDateLong,
  formatDayNumber,
  formatTimeRange,
  formatWeekdayShort,
} from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { todayInMadrid } from "@/lib/timezone";

type View = "dia" | "semana" | "mes";

interface CalendarioPageProps {
  searchParams: Promise<{ vista?: string; fecha?: string; sala?: string }>;
}

function buildHref(view: View, date: string, roomId?: string) {
  const params = new URLSearchParams({ vista: view, fecha: date });
  if (roomId) params.set("sala", roomId);
  return `/admin/calendario?${params.toString()}`;
}

export default async function AdminCalendarioPage({ searchParams }: CalendarioPageProps) {
  const { vista, fecha, sala } = await searchParams;
  const view: View = vista === "semana" || vista === "mes" ? vista : "dia";
  const date = fecha ?? todayInMadrid();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const rooms = await getAllRooms(supabase);

  const typeLabel: Record<string, string | null> = {
    coworker: null,
    guest: dict.admin.calendar.guestLabel,
    contact: dict.admin.calendar.guestLabel,
    internal: dict.admin.calendar.internalLabel,
    event: dict.admin.calendar.eventLabel,
  };

  function label(b: AdminBooking) {
    return b.contactName ?? typeLabel[b.bookingType] ?? b.bookingType;
  }

  function filterRoom(bookings: AdminBooking[]) {
    return sala ? bookings.filter((b) => b.roomId === sala) : bookings;
  }

  let rangeStart = date;
  let rangeEnd = addDays(date, 1);
  if (view === "semana") {
    rangeStart = startOfWeek(date);
    rangeEnd = addDays(rangeStart, 7);
  } else if (view === "mes") {
    const weeks = monthGridWeeks(date);
    rangeStart = weeks[0][0];
    rangeEnd = addDays(weeks[weeks.length - 1][6], 1);
  }

  const bookings = filterRoom(await getBookingsInLocalRange(supabase, rangeStart, rangeEnd));

  const prevHref =
    view === "dia"
      ? buildHref("dia", addDays(date, -1), sala)
      : view === "semana"
        ? buildHref("semana", addDays(startOfWeek(date), -7), sala)
        : buildHref("mes", addMonths(date, -1), sala);

  const nextHref =
    view === "dia"
      ? buildHref("dia", addDays(date, 1), sala)
      : view === "semana"
        ? buildHref("semana", addDays(startOfWeek(date), 7), sala)
        : buildHref("mes", addMonths(date, 1), sala);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.admin.calendar.title}</h1>
        </div>

        <CalendarRoomFilter
          rooms={rooms}
          view={view}
          date={date}
          selectedRoomId={sala}
          allRoomsLabel={dict.admin.calendar.allRooms}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {(["dia", "semana", "mes"] as View[]).map((v) => (
            <Link
              key={v}
              href={buildHref(v, date, sala)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                view === v ? "bg-cream text-brown-dark" : "text-warm-gray"
              }`}
            >
              {v === "dia" ? dict.admin.calendar.day : v === "semana" ? dict.admin.calendar.week : dict.admin.calendar.month}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href={prevHref} className="rounded-lg bg-white p-2 shadow-sm">
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <Link
            href={buildHref(view, todayInMadrid(), sala)}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-brown-dark shadow-sm"
          >
            {dict.admin.calendar.today}
          </Link>
          <Link href={nextHref} className="rounded-lg bg-white p-2 shadow-sm">
            <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {view === "dia" && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-ink">{formatDateLong(date, locale)}</h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-sm text-warm-gray">{dict.admin.calendar.noBookings}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {bookings
                .sort((a, b) => a.startMinutes - b.startMinutes)
                .map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink">
                      {formatTimeRange(b.startMinutes, b.endMinutes)} · {b.roomName}
                    </span>
                    <span className="text-warm-gray">{label(b)}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}

      {view === "semana" && (
        <div className="grid gap-3 overflow-x-auto md:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(rangeStart, i)).map((day) => {
            const dayBookings = bookings
              .filter((b) => b.date === day)
              .sort((a, b) => a.startMinutes - b.startMinutes);
            return (
              <Link
                key={day}
                href={buildHref("dia", day, sala)}
                className="min-w-[140px] rounded-2xl bg-white p-3 shadow-sm"
              >
                <p className="text-xs font-medium uppercase text-warm-gray">
                  {formatWeekdayShort(day, locale)} {formatDayNumber(day)}
                </p>
                <ul className="mt-2 flex flex-col gap-1 text-xs">
                  {dayBookings.map((b) => (
                    <li key={b.id} className="text-ink">
                      {formatTimeRange(b.startMinutes, b.endMinutes)} {b.roomName}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      )}

      {view === "mes" && (
        <div className="flex flex-col gap-2">
          {monthGridWeeks(date).map((week, i) => (
            <div key={i} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const count = bookings.filter((b) => b.date === day).length;
                const inMonth = day.slice(0, 7) === date.slice(0, 7);
                return (
                  <Link
                    key={day}
                    href={buildHref("dia", day, sala)}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                      inMonth ? "bg-white text-ink" : "bg-white/40 text-warm-gray/60"
                    }`}
                  >
                    <span>{formatDayNumber(day)}</span>
                    {count > 0 && (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brown-dark" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
