import Image from "next/image";
import Link from "next/link";
import { ChevronRight, DoorOpen, Users } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Room } from "@/types/domain";

interface RoomCardProps {
  room: Room;
  dict: Dictionary["room"];
}

export function RoomCard({ room, dict }: RoomCardProps) {
  return (
    <Link
      href={`/calendario?sala=${room.id}`}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-sand/70 to-cream">
        {room.imagePath ? (
          <Image
            src={room.imagePath}
            alt={room.name}
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover"
          />
        ) : (
          <DoorOpen className="h-9 w-9 text-brown-dark/70" strokeWidth={1.5} />
        )}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-brown-dark">
          <Users className="h-3 w-3" strokeWidth={2} />
          {room.capacityMin}–{room.capacityMax} {dict.people}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="font-semibold text-ink">{room.name}</p>
        <span className="mt-auto flex items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-brown-dark py-2 text-xs font-medium text-white sm:text-sm">
          {dict.availability}
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}
