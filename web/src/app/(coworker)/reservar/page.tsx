import { RoomCard } from "@/components/home/RoomCard";
import { mockRooms } from "@/lib/mock-data";

export default function ReservarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Reservar sala</h1>
        <p className="text-sm text-warm-gray">
          Elige una sala para ver su disponibilidad.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {mockRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
        La selección de día, hora y confirmación de la reserva estará disponible
        próximamente.
      </p>
    </div>
  );
}
