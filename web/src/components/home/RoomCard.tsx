import Link from "next/link";
import { ChevronRight, DoorOpen, Users } from "lucide-react";
import type { Room } from "@/types/domain";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link
      href={`/reservar?sala=${room.id}`}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-sand/70 to-cream">
        <DoorOpen className="h-9 w-9 text-brown-dark/70" strokeWidth={1.5} />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-brown-dark">
          <Users className="h-3 w-3" strokeWidth={2} />
          {room.capacityLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-semibold text-ink">{room.name}</p>
          <p className="text-sm text-warm-gray">{room.subtitle}</p>
        </div>
        <span className="mt-auto flex items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-brown-dark py-2 text-xs font-medium text-white sm:text-sm">
          Disponibilidad
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}
