import { BookingCard } from "@/components/home/BookingCard";
import { getBookings, getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function ReservasPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const dict = getDictionary(await getLocale());
  const supabase = await createClient();
  const bookings = await getBookings(supabase, current.contactId);

  // Bookings come back soonest-last (starts_at desc, which suits Histórico);
  // reverse just the upcoming ones so the next reservation shows first.
  const upcoming = bookings.filter((booking) => booking.status === "upcoming").reverse();
  const history = bookings.filter((booking) => booking.status !== "upcoming");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.reservas.title}</h1>
        <p className="text-sm text-warm-gray">{dict.reservas.subtitle}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{dict.reservas.upcoming}</h2>
        <div className="flex flex-col gap-3">
          {upcoming.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.reservas.noUpcoming}
            </p>
          ) : (
            upcoming.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{dict.reservas.history}</h2>
        <div className="flex flex-col gap-3">
          {history.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.reservas.noHistory}
            </p>
          ) : (
            history.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>
    </div>
  );
}
