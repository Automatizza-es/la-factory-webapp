import { BookingCard } from "@/components/home/BookingCard";
import { getBookings, getCurrentCoworker } from "@/lib/data/coworker";
import { createClient } from "@/lib/supabase/server";

export default async function ReservasPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const supabase = await createClient();
  const bookings = await getBookings(supabase, current.contactId);

  const upcoming = bookings.filter((booking) => booking.status === "upcoming");
  const history = bookings.filter((booking) => booking.status !== "upcoming");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mis reservas</h1>
        <p className="text-sm text-warm-gray">
          Consulta, modifica o cancela tus reservas de salas.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Próximas</h2>
        <div className="flex flex-col gap-3">
          {upcoming.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              No tienes reservas próximas.
            </p>
          ) : (
            upcoming.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Histórico</h2>
        <div className="flex flex-col gap-3">
          {history.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              Todavía no tienes reservas pasadas.
            </p>
          ) : (
            history.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>
    </div>
  );
}
