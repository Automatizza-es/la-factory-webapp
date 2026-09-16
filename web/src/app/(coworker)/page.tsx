import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookingCard } from "@/components/home/BookingCard";
import { QuotaCard } from "@/components/home/QuotaCard";
import { RoomCard } from "@/components/home/RoomCard";
import { mockBookings, mockCoworker, mockQuota, mockRooms } from "@/lib/mock-data";

export default function HomePage() {
  const upcomingBookings = mockBookings
    .filter((booking) => booking.status === "upcoming")
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Hola, {mockCoworker.firstName}</h1>
        <p className="text-sm text-warm-gray">Qué bueno tenerte por aquí</p>
      </div>

      <QuotaCard quota={mockQuota} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Reservar una sala</h2>
          <Link
            href="/reservar"
            className="flex items-center gap-0.5 text-sm font-medium text-brown-dark"
          >
            Ver calendario
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mockRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Próximas reservas</h2>
          <Link
            href="/reservas"
            className="flex items-center gap-0.5 text-sm font-medium text-brown-dark"
          >
            Ver todas
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {upcomingBookings.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              No tienes reservas próximas.
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
