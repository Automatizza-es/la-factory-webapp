"use client";

import Image from "next/image";
import type { Room } from "@/types/domain";

interface RoomSwitcherProps {
  rooms: Room[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
}

export function RoomSwitcher({ rooms, activeRoomId, onSelect }: RoomSwitcherProps) {
  return (
    <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
      {rooms.map((room) => {
        const active = room.id === activeRoomId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={`flex flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors ${
              active ? "bg-brown-dark" : "bg-transparent"
            }`}
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-sand/50">
              {room.imagePath && (
                <Image src={room.imagePath} alt={room.name} fill className="object-cover" />
              )}
            </div>
            <span
              className={`truncate text-sm font-semibold ${active ? "text-white" : "text-ink"}`}
            >
              {room.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
