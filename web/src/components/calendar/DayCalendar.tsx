"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { formatDateLong, minutesToTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { RoomOccupancyBlock } from "@/lib/data/coworker";
import type { Room } from "@/types/domain";

const GRID_START_MINUTES = 7 * 60;
const GRID_END_MINUTES = 21 * 60;
const SLOT_MINUTES = 30;
const HOUR_PX = 64;
const GRID_HEIGHT = ((GRID_END_MINUTES - GRID_START_MINUTES) / 60) * HOUR_PX;

function toY(minutes: number) {
  return ((minutes - GRID_START_MINUTES) / 60) * HOUR_PX;
}

interface Selection {
  roomId: string;
  startMinutes: number;
  endMinutes: number;
}

interface DayCalendarProps {
  date: string;
  rooms: Room[];
  occupancy: RoomOccupancyBlock[];
  dict: Dictionary["calendar"];
  bookingDict: Dictionary["booking"];
  roomDict: Dictionary["room"];
  locale: Locale;
}

export function DayCalendar({
  date,
  rooms,
  occupancy,
  dict,
  bookingDict,
  roomDict,
  locale,
}: DayCalendarProps) {
  const [selection, setSelection] = useState<Selection | null>(null);

  const occupancyByRoom = useMemo(() => {
    const map = new Map<string, RoomOccupancyBlock[]>();
    for (const block of occupancy) {
      const list = map.get(block.roomId) ?? [];
      list.push(block);
      map.set(block.roomId, list);
    }
    return map;
  }, [occupancy]);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let m = GRID_START_MINUTES; m <= GRID_END_MINUTES; m += 60) list.push(m);
    return list;
  }, []);

  const slots = useMemo(() => {
    const list: number[] = [];
    for (let m = GRID_START_MINUTES; m < GRID_END_MINUTES; m += SLOT_MINUTES) list.push(m);
    return list;
  }, []);

  function isFree(roomId: string, start: number, end: number) {
    const blocks = occupancyByRoom.get(roomId) ?? [];
    return !blocks.some((b) => start < b.endMinutes && end > b.startMinutes);
  }

  function handleSlotClick(roomId: string, slotStart: number) {
    const blocks = (occupancyByRoom.get(roomId) ?? []).filter((b) => b.startMinutes >= slotStart);
    const nextStart = blocks.length > 0 ? Math.min(...blocks.map((b) => b.startMinutes)) : Infinity;
    const end = Math.min(slotStart + 60, nextStart, GRID_END_MINUTES);
    setSelection({ roomId, startMinutes: slotStart, endMinutes: end });
  }

  const selectedRoom = selection ? rooms.find((r) => r.id === selection.roomId) : undefined;

  return (
    <div className="relative">
      <div className="flex">
        <div className="w-10 shrink-0" />
        {rooms.map((room) => (
          <div key={room.id} className="flex flex-1 flex-col items-center gap-1.5 px-1 pb-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-sand/50">
              {room.imagePath && (
                <Image src={room.imagePath} alt={room.name} fill className="object-cover" />
              )}
            </div>
            <p className="text-center text-[11px] font-medium leading-tight text-ink">
              {room.name}
            </p>
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="relative w-10 shrink-0" style={{ height: GRID_HEIGHT }}>
          {hours.map((m) => (
            <div
              key={m}
              className="absolute right-1 -translate-y-1/2 text-[11px] text-warm-gray"
              style={{ top: toY(m) }}
            >
              {minutesToTime(m)}
            </div>
          ))}
        </div>

        {rooms.map((room) => (
          <div
            key={room.id}
            className="relative flex-1 border-l border-sand/40"
            style={{ height: GRID_HEIGHT }}
          >
            {hours.map((m) => (
              <div
                key={m}
                className="absolute left-0 right-0 border-t border-sand/30"
                style={{ top: toY(m) }}
              />
            ))}

            {slots.map((slotStart) => {
              const free = isFree(room.id, slotStart, slotStart + SLOT_MINUTES);
              if (!free) return null;
              return (
                <button
                  key={slotStart}
                  type="button"
                  onClick={() => handleSlotClick(room.id, slotStart)}
                  className="absolute left-0 right-0 transition-colors hover:bg-sand/20 active:bg-sand/30"
                  style={{ top: toY(slotStart), height: toY(slotStart + SLOT_MINUTES) - toY(slotStart) }}
                />
              );
            })}

            {(occupancyByRoom.get(room.id) ?? []).map((block) => {
              const top = toY(Math.max(block.startMinutes, GRID_START_MINUTES));
              const bottom = toY(Math.min(block.endMinutes, GRID_END_MINUTES));
              return (
                <div
                  key={block.id}
                  className={`absolute left-0.5 right-0.5 overflow-hidden rounded-lg px-1.5 py-1 text-[11px] ${
                    block.isMine
                      ? "bg-brown-dark/15 text-brown-dark"
                      : "bg-warm-gray/20 text-warm-gray"
                  }`}
                  style={{ top, height: Math.max(bottom - top, 18) }}
                >
                  <p className="font-medium">
                    {block.isMine ? bookingDict.statusUpcoming : dict.occupied}
                  </p>
                  <p className="opacity-80">
                    {minutesToTime(block.startMinutes)}–{minutesToTime(block.endMinutes)}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selection && selectedRoom && (
        <div className="fixed inset-0 z-30 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelection(null)}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="relative w-full max-w-[480px] rounded-t-3xl bg-white p-5 pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">{dict.newBooking}</h3>
              <button type="button" onClick={() => setSelection(null)} aria-label="Close">
                <X className="h-5 w-5 text-warm-gray" strokeWidth={2} />
              </button>
            </div>
            <p className="text-sm text-warm-gray">
              {formatDateLong(date, locale)} · {minutesToTime(selection.startMinutes)}–
              {minutesToTime(selection.endMinutes)}
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-cream p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/50">
                {selectedRoom.imagePath && (
                  <Image
                    src={selectedRoom.imagePath}
                    alt={selectedRoom.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">{selectedRoom.name}</p>
                <p className="text-sm text-warm-gray">
                  {selectedRoom.capacityMin}–{selectedRoom.capacityMax} {roomDict.people}
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-brown-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {dict.available}
              </span>
            </div>

            <Link
              href={`/reservar?sala=${selection.roomId}&fecha=${date}&inicio=${minutesToTime(
                selection.startMinutes,
              )}&fin=${minutesToTime(selection.endMinutes)}`}
              className="mt-4 flex items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white"
            >
              {dict.continueLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
