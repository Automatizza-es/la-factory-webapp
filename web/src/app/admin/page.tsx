import Link from "next/link";
import {
  CalendarClock,
  CalendarPlus,
  ChevronRight,
  DoorOpen,
  ListChecks,
  Package,
  PackagePlus,
  PartyPopper,
  UserPlus,
} from "lucide-react";
import {
  getAllRooms,
  getBookingsInLocalRange,
  getMinutesBookedByThisMonth,
  getUpcomingBookings,
  type AdminBooking,
} from "@/lib/data/admin";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getAdminEvents } from "@/lib/data/events";
import { getAdminPackagesSummary } from "@/lib/data/packages";
import { formatDateLong, formatMinutesAsHours, formatTimeRange, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayInMadrid, utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

// What a room is doing right now: busy until the end of the current booking
// (and any booking that starts the moment it ends), or free until the next
// one today.
function roomStatusNow(bookings: AdminBooking[], nowMinutes: number) {
  const sorted = [...bookings].sort((a, b) => a.startMinutes - b.startMinutes);
  const current = sorted.find((b) => b.startMinutes <= nowMinutes && b.endMinutes > nowMinutes);
  if (current) {
    let until = current.endMinutes;
    for (const b of sorted) {
      if (b.startMinutes === until) until = b.endMinutes;
    }
    return { busy: true, until };
  }
  const next = sorted.find((b) => b.startMinutes > nowMinutes);
  return { busy: false, until: next ? next.startMinutes : null };
}

function Card({
  title,
  icon: Icon,
  href,
  seeAllLabel,
  className = "",
  children,
}: {
  title: string;
  icon: typeof CalendarClock;
  href?: string;
  seeAllLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-ink">
          <Icon className="h-4 w-4 text-brown-dark" strokeWidth={2} />
          {title}
        </h2>
        {href && seeAllLabel && (
          <Link href={href} className="flex items-center text-xs font-medium text-brown-dark">
            {seeAllLabel}
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.admin.dashboard;
  const supabase = await createClient();
  const current = await getCurrentCoworker();

  const today = todayInMadrid();
  const nowMinutes = utcIsoToZonedDateAndMinutes(new Date().toISOString()).minutes;
  const [rooms, todayBookings, upcoming, packages, events, bookedMinutes] = await Promise.all([
    getAllRooms(supabase),
    getBookingsInLocalRange(supabase, today, addDays(today, 1)),
    getUpcomingBookings(supabase),
    getAdminPackagesSummary(supabase),
    getAdminEvents(supabase),
    current ? getMinutesBookedByThisMonth(supabase, current.contactId) : Promise.resolve(0),
  ]);

  const nextEvent = events
    .filter((e) => e.status === "published" && new Date(e.startsAt) > new Date())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const bookingName = (b: AdminBooking) => b.contactName ?? dict.admin.calendar.internalLabel;

  const quickActions = [
    { href: "/admin/calendario", label: t.newBooking, icon: CalendarPlus },
    { href: "/admin/coworkers/new", label: t.newCoworker, icon: UserPlus },
    { href: "/admin/paquetes/new", label: t.registerPackage, icon: PackagePlus },
    { href: "/admin/eventos/new", label: t.newEvent, icon: PartyPopper },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
          <p className="text-sm text-warm-gray">{t.subtitle}</p>
        </div>
        <p className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brown-dark shadow-sm">
          {dict.admin.createBooking.bookedThisMonth(formatMinutesAsHours(bookedMinutes))}
        </p>
      </div>

      <nav aria-label={t.quickActions} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-2xl bg-white p-4 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-sand/20"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream">
              <Icon className="h-4 w-4 text-brown-dark" strokeWidth={2} />
            </span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title={t.todayBookings}
          icon={CalendarClock}
          href={`/admin/calendario?fecha=${today}`}
          seeAllLabel={t.seeAll}
          className="lg:col-span-2"
        >
          {todayBookings.length === 0 ? (
            <p className="text-sm text-warm-gray">{t.noBookingsToday}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-sand/30">
              {todayBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="shrink-0 font-medium text-ink">
                    {formatTimeRange(b.startMinutes, b.endMinutes)}
                  </span>
                  <span className="flex-1 truncate text-ink">{bookingName(b)}</span>
                  <span className="shrink-0 text-warm-gray">{b.roomName}</span>
                  <span className="hidden shrink-0 text-warm-gray sm:inline">
                    {formatMinutesAsHours(b.endMinutes - b.startMinutes)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t.roomsNow} icon={DoorOpen}>
          <ul className="flex flex-col gap-3">
            {rooms.map((room) => {
              const status = roomStatusNow(
                todayBookings.filter((b) => b.roomId === room.id),
                nowMinutes,
              );
              return (
                <li key={room.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{room.name}</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      status.busy ? "text-amber-700" : "text-emerald-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${status.busy ? "bg-amber-500" : "bg-emerald-500"}`}
                    />
                    {status.busy
                      ? t.busyUntil(minutesToTime(status.until!))
                      : status.until !== null
                        ? t.freeUntil(minutesToTime(status.until))
                        : t.freeRestOfDay}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card
          title={t.upcoming}
          icon={ListChecks}
          href="/admin/calendario?vista=semana"
          seeAllLabel={t.seeAll}
          className="lg:col-span-2"
        >
          {upcoming.length === 0 ? (
            <p className="text-sm text-warm-gray">{t.noUpcoming}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-sand/30">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-x-3 py-2 text-sm">
                  <span className="text-ink">
                    {formatDateLong(b.date, locale)} · {formatTimeRange(b.startMinutes, b.endMinutes)}
                  </span>
                  <span className="text-warm-gray">
                    {bookingName(b)} · {b.roomName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card title={t.packagesTitle} icon={Package} href="/admin/paquetes" seeAllLabel={t.seeAll}>
            <p className={`text-sm font-medium ${packages.pendingCount > 0 ? "text-amber-700" : "text-warm-gray"}`}>
              {packages.pendingCount > 0 ? t.pendingPackages(packages.pendingCount) : t.noPendingPackages}
            </p>
            {packages.latest.length > 0 && (
              <>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-warm-gray">
                  {t.latestPackages}
                </p>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {packages.latest.map((p) => {
                    const when = utcIsoToZonedDateAndMinutes(p.receivedAt);
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-ink">{p.recipientName}</span>
                        <span className="shrink-0 text-xs text-warm-gray">
                          {formatDateLong(when.date, locale)} · {minutesToTime(when.minutes)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Card>

          <Card title={t.nextEvent} icon={PartyPopper} href="/admin/eventos" seeAllLabel={t.seeAll}>
            {nextEvent ? (
              <Link href={`/admin/eventos/${nextEvent.id}/asistentes`} className="block">
                <p className="font-medium text-ink">{nextEvent.title}</p>
                <p className="text-sm text-warm-gray">
                  {(() => {
                    const start = utcIsoToZonedDateAndMinutes(nextEvent.startsAt);
                    return `${formatDateLong(start.date, locale)} · ${minutesToTime(start.minutes)}`;
                  })()}
                </p>
                <p className="mt-1 text-sm font-medium text-brown-dark">
                  {t.registered(nextEvent.registeredCount, nextEvent.capacity)}
                </p>
              </Link>
            ) : (
              <p className="text-sm text-warm-gray">{t.noUpcomingEvents}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
