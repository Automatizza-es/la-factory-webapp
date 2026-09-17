import { CalendarClock, CheckCircle2, DoorOpen } from "lucide-react";
import { getAllRooms, getBookingsInLocalRange, getUpcomingBookings } from "@/lib/data/admin";
import { formatDateLong, formatMinutesAsHours, formatTimeRange } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayInMadrid } from "@/lib/timezone";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const today = todayInMadrid();
  const [rooms, todayBookings, upcoming] = await Promise.all([
    getAllRooms(supabase),
    getBookingsInLocalRange(supabase, today, addDays(today, 1)),
    getUpcomingBookings(supabase),
  ]);

  const minutesByRoom = new Map<string, number>();
  for (const booking of todayBookings) {
    const minutes = booking.endMinutes - booking.startMinutes;
    minutesByRoom.set(booking.roomId, (minutesByRoom.get(booking.roomId) ?? 0) + minutes);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.dashboard.title}</h1>
        <p className="text-sm text-warm-gray">{dict.admin.dashboard.subtitle}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <CalendarClock className="h-4 w-4 text-brown-dark" strokeWidth={2} />
            {dict.admin.dashboard.todayBookings}
          </h2>
          {todayBookings.length === 0 ? (
            <p className="mt-3 text-sm text-warm-gray">{dict.admin.dashboard.noBookingsToday}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {todayBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {formatTimeRange(b.startMinutes, b.endMinutes)} · {b.roomName}
                  </span>
                  <span className="text-warm-gray">{b.contactName ?? dict.admin.calendar.internalLabel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <DoorOpen className="h-4 w-4 text-brown-dark" strokeWidth={2} />
            {dict.room.availability}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {rooms.map((room) => (
              <li key={room.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{room.name}</span>
                <span className="text-warm-gray">
                  {formatMinutesAsHours(minutesByRoom.get(room.id) ?? 0)}{" "}
                  {dict.admin.dashboard.bookedToday}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-ink">{dict.admin.dashboard.upcoming}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-warm-gray">{dict.admin.dashboard.noUpcoming}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">
                  {formatDateLong(b.date, locale)} · {formatTimeRange(b.startMinutes, b.endMinutes)} ·{" "}
                  {b.roomName}
                </span>
                <span className="text-warm-gray">{b.contactName ?? dict.admin.calendar.internalLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-ink">
          <CheckCircle2 className="h-4 w-4 text-brown-dark" strokeWidth={2} />
          {dict.admin.dashboard.incidents}
        </h2>
        <p className="mt-3 text-sm text-warm-gray">{dict.admin.dashboard.noIncidents}</p>
      </section>
    </div>
  );
}
