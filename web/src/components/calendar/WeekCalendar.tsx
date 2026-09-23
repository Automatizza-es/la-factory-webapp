"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  GRID_END_MINUTES,
  GRID_HEIGHT,
  GRID_START_MINUTES,
  SLOT_MINUTES,
  gridLines as buildGridLines,
  hourMarks,
  slotStarts,
  toY,
} from "@/lib/calendar-grid";
import { formatDayNumber, minutesToTime, formatWeekdayNarrow } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { RoomOccupancyBlock } from "@/lib/data/coworker";
import type { Locale } from "@/lib/i18n/config";
import { todayInMadrid, utcIsoToZonedDateAndMinutes } from "@/lib/timezone";
import type { Room } from "@/types/domain";
import { RoomSwitcher } from "./RoomSwitcher";

interface WeekCalendarProps {
  weekDates: string[];
  rooms: Room[];
  activeRoomId: string;
  occupancy: RoomOccupancyBlock[];
  dict: Dictionary["calendar"];
  locale: Locale;
  myName: string;
}

export function WeekCalendar({
  weekDates,
  rooms,
  activeRoomId,
  occupancy,
  dict,
  locale,
  myName,
}: WeekCalendarProps) {
  const router = useRouter();
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  const today = todayInMadrid();
  const nowMinutes = utcIsoToZonedDateAndMinutes(new Date().toISOString());

  const hours = useMemo(() => hourMarks(), []);
  const gridLines = useMemo(() => buildGridLines(), []);
  const slots = useMemo(() => slotStarts(), []);

  const occupancyByDate = useMemo(() => {
    const map = new Map<string, RoomOccupancyBlock[]>();
    for (const block of occupancy) {
      if (block.roomId !== activeRoomId) continue;
      const list = map.get(block.date) ?? [];
      list.push(block);
      map.set(block.date, list);
    }
    return map;
  }, [occupancy, activeRoomId]);

  function isFree(date: string, start: number, end: number) {
    const blocks = occupancyByDate.get(date) ?? [];
    return !blocks.some((b) => start < b.endMinutes && end > b.startMinutes);
  }

  function goToDay(date: string) {
    router.push(`/calendario?fecha=${date}&sala=${activeRoomId}`);
  }

  function switchRoom(roomId: string) {
    router.push(`/calendario?fecha=${weekDates[0]}&vista=semana&sala=${roomId}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <RoomSwitcher rooms={rooms} activeRoomId={activeRoomId} onSelect={switchRoom} />

      <div className="relative overflow-x-auto">
        <div className="flex min-w-[560px]">
          <div className="w-10 shrink-0" />
          {weekDates.map((date) => {
            const isPast = date < today;
            const isToday = date === today;
            return (
              <div key={date} className="flex flex-1 flex-col items-center gap-0.5 px-1 pb-2">
                <span className="text-[11px] font-medium text-warm-gray">
                  {formatWeekdayNarrow(date, locale)}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-semibold ${
                    isToday ? "bg-brown-dark text-white" : isPast ? "text-warm-gray" : "text-ink"
                  }`}
                >
                  {formatDayNumber(date)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex min-w-[560px]">
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

          {weekDates.map((date) => {
            const isPastDay = date < today;
            const dayNowMinutes = date === today ? nowMinutes.minutes : null;
            const blocks = occupancyByDate.get(date) ?? [];

            return (
              <div key={date} className="relative flex-1 border-l border-sand/40" style={{ height: GRID_HEIGHT }}>
                {gridLines.map(({ minute, major }) => (
                  <div
                    key={minute}
                    className={`absolute left-0 right-0 border-t ${
                      major ? "border-sand/50" : "border-sand/15"
                    }`}
                    style={{ top: toY(minute) }}
                  />
                ))}

                {slots.map((slotStart) => {
                  const free = isFree(date, slotStart, slotStart + SLOT_MINUTES);
                  if (!free) return null;

                  const isPast = isPastDay || (dayNowMinutes !== null && slotStart < dayNowMinutes);
                  const style = {
                    top: toY(slotStart),
                    height: toY(slotStart + SLOT_MINUTES) - toY(slotStart),
                  };

                  if (isPast) {
                    return (
                      <div
                        key={slotStart}
                        aria-disabled="true"
                        className="absolute left-0 right-0 cursor-not-allowed bg-warm-gray/15"
                        style={style}
                      />
                    );
                  }

                  return (
                    <button
                      key={slotStart}
                      type="button"
                      onClick={() => goToDay(date)}
                      className="absolute left-0 right-0 transition-colors hover:bg-sand/20 active:bg-sand/30"
                      style={style}
                    />
                  );
                })}

                {blocks.map((block) => {
                  const top = toY(Math.max(block.startMinutes, GRID_START_MINUTES));
                  const bottom = toY(Math.min(block.endMinutes, GRID_END_MINUTES));
                  const blockIsPast =
                    isPastDay || (dayNowMinutes !== null && block.endMinutes <= dayNowMinutes);
                  const style = { top, height: Math.max(bottom - top, 18) };
                  const content = (
                    <>
                      <p className="truncate font-medium">
                        {block.isMine ? myName : dict.booked}
                      </p>
                      <p className="truncate opacity-80">
                        {minutesToTime(block.startMinutes)}–{minutesToTime(block.endMinutes)}
                      </p>
                    </>
                  );

                  if (block.isMine && !blockIsPast) {
                    return (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => goToDay(date)}
                        className="absolute left-0.5 right-0.5 overflow-hidden rounded-lg bg-brown-dark/15 px-1.5 py-1 text-left text-[10px] text-brown-dark transition-colors hover:bg-brown-dark/25"
                        style={style}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <div
                      key={block.id}
                      className={`absolute left-0.5 right-0.5 overflow-hidden rounded-lg px-1.5 py-1 text-[10px] ${
                        block.isMine
                          ? "bg-brown-dark/15 text-brown-dark"
                          : "bg-warm-gray/20 text-warm-gray"
                      }`}
                      style={style}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {activeRoom && (
        <div className="flex items-center gap-3 rounded-2xl bg-cream p-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sand/50">
            {activeRoom.imagePath && (
              <Image src={activeRoom.imagePath} alt={activeRoom.name} fill className="object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{activeRoom.name}</p>
            <p className="text-xs text-warm-gray">{dict.tapFreeSlot}</p>
          </div>
        </div>
      )}
    </div>
  );
}
