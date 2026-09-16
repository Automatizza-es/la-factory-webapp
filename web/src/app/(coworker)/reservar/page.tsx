import { BookingForm } from "@/components/booking/BookingForm";
import { RoomCard } from "@/components/home/RoomCard";
import { getBookings, getCurrentCoworker, getQuotaSummary, getRooms } from "@/lib/data/coworker";
import { createClient } from "@/lib/supabase/server";
import { minutesToTime } from "@/lib/format";

interface ReservarPageProps {
  searchParams: Promise<{ sala?: string; reserva?: string }>;
}

export default async function ReservarPage({ searchParams }: ReservarPageProps) {
  const { sala, reserva } = await searchParams;
  const current = await getCurrentCoworker();
  if (!current) return null;

  const supabase = await createClient();
  const rooms = await getRooms(supabase);
  const room = sala ? rooms.find((r) => r.id === sala) : undefined;

  if (!room) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Reservar sala</h1>
          <p className="text-sm text-warm-gray">Elige una sala para ver su disponibilidad.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      </div>
    );
  }

  const [quota, existingBooking] = await Promise.all([
    getQuotaSummary(supabase, current.contactId),
    reserva
      ? getBookings(supabase, current.contactId).then((all) =>
          all.find((b) => b.id === reserva),
        )
      : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">
          {existingBooking ? "Modificar reserva" : "Reservar sala"}
        </h1>
        <p className="text-sm text-warm-gray">Elige el día y el horario que necesites.</p>
      </div>

      <BookingForm
        room={room}
        quota={quota}
        existingBookingId={existingBooking?.id}
        initialDate={existingBooking?.date}
        initialStartTime={existingBooking ? minutesToTime(existingBooking.startMinutes) : undefined}
        initialEndTime={existingBooking ? minutesToTime(existingBooking.endMinutes) : undefined}
      />
    </div>
  );
}
