"use client";

import { useRouter } from "next/navigation";
import type { AdminRoom } from "@/lib/data/admin";

interface CalendarRoomFilterProps {
  rooms: AdminRoom[];
  view: string;
  date: string;
  selectedRoomId?: string;
  allRoomsLabel: string;
}

export function CalendarRoomFilter({
  rooms,
  view,
  date,
  selectedRoomId,
  allRoomsLabel,
}: CalendarRoomFilterProps) {
  const router = useRouter();

  return (
    <select
      defaultValue={selectedRoomId ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams({ vista: view, fecha: date });
        if (e.target.value) params.set("sala", e.target.value);
        router.push(`/admin/calendario?${params.toString()}`);
      }}
      className="rounded-xl border border-sand bg-white px-3 py-2 text-sm text-ink"
    >
      <option value="">{allRoomsLabel}</option>
      {rooms.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
