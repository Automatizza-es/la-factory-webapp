import { BookingForm } from "@/components/booking/BookingForm";
import { RoomCard } from "@/components/home/RoomCard";
import { getBookings, getCurrentCoworker, getQuotaSummary, getRooms } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { minutesToTime } from "@/lib/format";

interface ReservarPageProps {
  searchParams: Promise<{
    sala?: string;
    reserva?: string;
    fecha?: string;
    inicio?: string;
    fin?: string;
  }>;
}

export default async function ReservarPage({ searchParams }: ReservarPageProps) {
  const { sala, reserva, fecha, inicio, fin } = await searchParams;
  const current = await getCurrentCoworker();
  if (!current) return null;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const rooms = await getRooms(supabase);
  const room = sala ? rooms.find((r) => r.id === sala) : undefined;

  if (!room) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.reservar.title}</h1>
          <p className="text-sm text-warm-gray">{dict.reservar.chooseRoom}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} dict={dict.room} />
          ))}
        </div>
      </div>
    );
  }

  const [quota, existingBooking] = await Promise.all([
    getQuotaSummary(supabase, current.contactId, locale),
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
          {existingBooking ? dict.reservar.modifyTitle : dict.reservar.title}
        </h1>
        <p className="text-sm text-warm-gray">{dict.reservar.chooseDateTime}</p>
      </div>

      <BookingForm
        room={room}
        quota={quota}
        existingBookingId={existingBooking?.id}
        initialDate={existingBooking?.date ?? fecha}
        initialStartTime={
          existingBooking ? minutesToTime(existingBooking.startMinutes) : inicio
        }
        initialEndTime={existingBooking ? minutesToTime(existingBooking.endMinutes) : fin}
      />
    </div>
  );
}
