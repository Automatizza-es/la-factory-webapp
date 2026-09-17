import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookingCard } from "@/components/home/BookingCard";
import { QuotaCard } from "@/components/home/QuotaCard";
import { RoomCard } from "@/components/home/RoomCard";
import { getBookings, getCurrentCoworker, getQuotaSummary, getRooms } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const [quota, rooms, bookings] = await Promise.all([
    getQuotaSummary(supabase, current.contactId, locale),
    getRooms(supabase),
    getBookings(supabase, current.contactId),
  ]);

  const upcomingBookings = bookings.filter((b) => b.status === "upcoming").slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">
          {dict.home.greeting}, {current.coworker.firstName}
        </h1>
        <p className="text-sm text-warm-gray">{dict.home.subtitle}</p>
      </div>

      {quota ? (
        <QuotaCard quota={quota} dict={dict.quota} />
      ) : (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
          {dict.home.noActivePlan}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{dict.home.bookRoom}</h2>
          <Link
            href="/reservar"
            className="flex items-center gap-0.5 text-sm font-medium text-brown-dark"
          >
            {dict.home.viewCalendar}
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} dict={dict.room} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{dict.home.upcomingBookings}</h2>
          <Link
            href="/reservas"
            className="flex items-center gap-0.5 text-sm font-medium text-brown-dark"
          >
            {dict.home.viewAll}
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {upcomingBookings.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.home.noUpcoming}
            </p>
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
