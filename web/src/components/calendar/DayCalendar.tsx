"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { cancelBooking, submitBooking } from "@/app/(coworker)/reservar/actions";
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
import { formatDateLong, formatMinutesAsHours, minutesToTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { RoomOccupancyBlock } from "@/lib/data/coworker";
import { todayInMadrid, utcIsoToZonedDateAndMinutes } from "@/lib/timezone";
import type { QuotaSummary, Room } from "@/types/domain";
import { RoomSwitcher } from "./RoomSwitcher";

interface Selection {
  roomId: string;
  startMinutes: number;
  endMinutes: number;
  bookingId?: string;
}

interface DayCalendarProps {
  date: string;
  rooms: Room[];
  occupancy: RoomOccupancyBlock[];
  quota: QuotaSummary | null;
  dict: Dictionary["calendar"];
  bookingDict: Dictionary["booking"];
  roomDict: Dictionary["room"];
  reservarDict: Dictionary["reservar"];
  roomOverlapText: string;
  locale: Locale;
  initialRoomId?: string;
}

export function DayCalendar({
  date,
  rooms,
  occupancy,
  quota,
  dict,
  bookingDict,
  roomDict,
  reservarDict,
  roomOverlapText,
  locale,
  initialRoomId,
}: DayCalendarProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusRoomId, setFocusRoomId] = useState<string | undefined>(initialRoomId);

  const visibleRooms = focusRoomId ? rooms.filter((r) => r.id === focusRoomId) : rooms;

  function switchFocusRoom(roomId: string) {
    setFocusRoomId(roomId);
    setSelection(null);
    setError(null);
    router.replace(`/calendario?fecha=${date}&sala=${roomId}`, { scroll: false });
  }

  const today = todayInMadrid();
  const isPastDay = date < today;
  const nowMinutes =
    date === today ? utcIsoToZonedDateAndMinutes(new Date().toISOString()).minutes : null;

  const occupancyByRoom = useMemo(() => {
    const map = new Map<string, RoomOccupancyBlock[]>();
    for (const block of occupancy) {
      const list = map.get(block.roomId) ?? [];
      list.push(block);
      map.set(block.roomId, list);
    }
    return map;
  }, [occupancy]);

  const hours = useMemo(() => hourMarks(), []);
  const gridLines = useMemo(() => buildGridLines(), []);
  const slots = useMemo(() => slotStarts(), []);

  function isFree(roomId: string, start: number, end: number, excludeBookingId?: string) {
    const blocks = occupancyByRoom.get(roomId) ?? [];
    return !blocks.some(
      (b) => b.id !== excludeBookingId && start < b.endMinutes && end > b.startMinutes,
    );
  }

  function handleSlotClick(roomId: string, slotStart: number) {
    const blocks = (occupancyByRoom.get(roomId) ?? []).filter((b) => b.startMinutes >= slotStart);
    const nextStart = blocks.length > 0 ? Math.min(...blocks.map((b) => b.startMinutes)) : Infinity;
    const end = Math.min(slotStart + 60, nextStart, GRID_END_MINUTES);
    setError(null);
    setSelection({ roomId, startMinutes: slotStart, endMinutes: end });
  }

  function adjustStart(delta: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const next = prev.startMinutes + delta;
      if (next < GRID_START_MINUTES || next > prev.endMinutes - 15) return prev;
      if (nowMinutes !== null && next <= nowMinutes) return prev;
      return { ...prev, startMinutes: next };
    });
  }

  function adjustEnd(delta: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const next = prev.endMinutes + delta;
      if (next > GRID_END_MINUTES || next < prev.startMinutes + 15) return prev;
      return { ...prev, endMinutes: next };
    });
  }

  function handleBookingClick(block: RoomOccupancyBlock) {
    setError(null);
    setSelection({
      roomId: block.roomId,
      startMinutes: block.startMinutes,
      endMinutes: block.endMinutes,
      bookingId: block.id,
    });
  }

  function closeSheet() {
    setSelection(null);
    setError(null);
  }

  async function handleConfirm() {
    if (!selection) return;
    setSubmitting(true);
    setError(null);

    const result = await submitBooking({
      roomId: selection.roomId,
      date,
      startTime: minutesToTime(selection.startMinutes),
      endTime: minutesToTime(selection.endMinutes),
      existingBookingId: selection.bookingId,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (selection.bookingId) {
      setSelection(null);
      setSubmitting(false);
      router.refresh();
    } else {
      router.push("/reservas");
    }
  }

  async function handleCancelBooking() {
    if (!selection?.bookingId) return;
    setCancelling(true);
    setError(null);

    const result = await cancelBooking(selection.bookingId);

    if (result.error) {
      setError(result.error);
      setCancelling(false);
      return;
    }

    setSelection(null);
    setCancelling(false);
    router.refresh();
  }

  const selectedRoom = selection ? rooms.find((r) => r.id === selection.roomId) : undefined;
  const durationMinutes = selection ? selection.endMinutes - selection.startMinutes : 0;
  const availableMinutes = quota ? quota.totalMinutes - quota.usedMinutes : null;
  const afterMinutes = availableMinutes !== null ? availableMinutes - durationMinutes : null;
  const selectionOverlaps = selection
    ? !isFree(selection.roomId, selection.startMinutes, selection.endMinutes, selection.bookingId)
    : false;

  return (
    <div className="relative">
      {focusRoomId && (
        <div className="mb-3">
          <RoomSwitcher rooms={rooms} activeRoomId={focusRoomId} onSelect={switchFocusRoom} />
        </div>
      )}

      <div className="flex">
        <div className="w-10 shrink-0" />
        {visibleRooms.map((room) => (
          <div key={room.id} className="flex flex-1 items-center gap-2 px-1 pb-2">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sand/50">
              {room.imagePath && (
                <Image src={room.imagePath} alt={room.name} fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold leading-tight text-ink">
                {room.name}
              </p>
              <p className="truncate text-[10px] leading-tight text-warm-gray">
                {room.capacityMin}–{room.capacityMax} {roomDict.people}
              </p>
            </div>
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

        {visibleRooms.map((room) => (
          <div
            key={room.id}
            className="relative flex-1 border-l border-sand/40"
            style={{ height: GRID_HEIGHT }}
          >
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
              const free = isFree(room.id, slotStart, slotStart + SLOT_MINUTES);
              if (!free) return null;

              const isPast = isPastDay || (nowMinutes !== null && slotStart < nowMinutes);
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
                  onClick={() => handleSlotClick(room.id, slotStart)}
                  className="absolute left-0 right-0 transition-colors hover:bg-sand/20 active:bg-sand/30"
                  style={style}
                />
              );
            })}

            {(occupancyByRoom.get(room.id) ?? []).map((block) => {
              const top = toY(Math.max(block.startMinutes, GRID_START_MINUTES));
              const bottom = toY(Math.min(block.endMinutes, GRID_END_MINUTES));
              const blockIsPast =
                isPastDay || (nowMinutes !== null && block.endMinutes <= nowMinutes);
              const style = { top, height: Math.max(bottom - top, 18) };
              const content = (
                <>
                  <p className="font-medium">
                    {block.isMine ? bookingDict.statusUpcoming : dict.booked}
                  </p>
                  <p className="opacity-80">
                    {minutesToTime(block.startMinutes)}–{minutesToTime(block.endMinutes)}
                  </p>
                </>
              );

              if (block.isMine && !blockIsPast) {
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => handleBookingClick(block)}
                    className="absolute left-0.5 right-0.5 overflow-hidden rounded-lg bg-brown-dark/15 px-1.5 py-1 text-left text-[11px] text-brown-dark transition-colors hover:bg-brown-dark/25"
                    style={style}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div
                  key={block.id}
                  className={`absolute left-0.5 right-0.5 overflow-hidden rounded-lg px-1.5 py-1 text-[11px] ${
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

            {selection && selection.roomId === room.id && (
              <div
                className="absolute left-0.5 right-0.5 z-10 flex items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-50 px-1.5 text-[11px] font-medium text-blue-700"
                style={{
                  top: toY(selection.startMinutes),
                  height: toY(selection.endMinutes) - toY(selection.startMinutes),
                }}
              >
                {minutesToTime(selection.startMinutes)}–{minutesToTime(selection.endMinutes)}
              </div>
            )}
          </div>
        ))}
      </div>

      {selection && selectedRoom && (
        <div className="fixed inset-0 z-30 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={closeSheet}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">
                {selection.bookingId ? dict.editBooking : dict.newBooking}
              </h3>
              <button type="button" onClick={closeSheet} aria-label="Close">
                <X className="h-5 w-5 text-warm-gray" strokeWidth={2} />
              </button>
            </div>
            <p className="text-sm text-warm-gray">
              {formatDateLong(date, locale)} · {minutesToTime(selection.startMinutes)}–
              {minutesToTime(selection.endMinutes)}
            </p>
            {!focusRoomId && <p className="mt-1 text-sm text-warm-gray">{dict.chooseRoomAndConfirm}</p>}

            {!focusRoomId && (
              <>
                <h4 className="mt-4 mb-2 text-sm font-semibold text-ink">{dict.availableRooms}</h4>
                <div className="flex flex-col gap-2">
                  {rooms.map((room) => {
                    const roomIsFree = isFree(
                      room.id,
                      selection.startMinutes,
                      selection.endMinutes,
                      selection.bookingId,
                    );
                    const isSelected = room.id === selection.roomId;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        disabled={!roomIsFree}
                        onClick={() => setSelection({ ...selection, roomId: room.id })}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          isSelected ? "border-brown-dark bg-cream" : "border-sand/50 bg-white"
                        }`}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand/50">
                          {room.imagePath && (
                            <Image
                              src={room.imagePath}
                              alt={room.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-ink">{room.name}</p>
                          <p className="text-sm text-warm-gray">
                            {room.capacityMin}–{room.capacityMax} {roomDict.people}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 text-xs font-medium ${
                            roomIsFree ? "text-emerald-600" : "text-warm-gray"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              roomIsFree ? "bg-emerald-500" : "bg-warm-gray"
                            }`}
                          />
                          {roomIsFree ? dict.available : dict.roomOccupied}
                        </span>
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                            isSelected ? "border-brown-dark bg-brown-dark" : "border-sand"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-4 flex items-center justify-center gap-6 rounded-2xl bg-cream p-4">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-warm-gray">{reservarDict.start}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustStart(-15)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brown-dark shadow-sm"
                    aria-label="-15 min"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                  <span className="w-14 text-center text-sm font-semibold text-ink">
                    {minutesToTime(selection.startMinutes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustStart(15)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brown-dark shadow-sm"
                    aria-label="+15 min"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-warm-gray">{reservarDict.end}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustEnd(-15)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brown-dark shadow-sm"
                    aria-label="-15 min"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                  <span className="w-14 text-center text-sm font-semibold text-ink">
                    {minutesToTime(selection.endMinutes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustEnd(15)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brown-dark shadow-sm"
                    aria-label="+15 min"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>
              </div>
            </div>

            {selectionOverlaps && (
              <p className="mt-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                {roomOverlapText}
              </p>
            )}

            <div className="mt-3 rounded-2xl bg-cream p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <p className="font-semibold text-ink">{dict.summary}</p>
                <span />
                <span className="text-warm-gray">{dict.roomLabel}</span>
                <span className="text-ink">{selectedRoom.name}</span>
                <span className="text-warm-gray">{reservarDict.duration}</span>
                <span className="text-ink">{formatMinutesAsHours(durationMinutes)}</span>
                {availableMinutes !== null && (
                  <>
                    <span className="text-warm-gray">{reservarDict.availableNow}</span>
                    <span className="text-ink">{formatMinutesAsHours(availableMinutes)}</span>
                  </>
                )}
                {afterMinutes !== null && (
                  <>
                    <span className="text-warm-gray">{reservarDict.afterBooking}</span>
                    <span className={afterMinutes < 0 ? "text-red-600" : "text-ink"}>
                      {formatMinutesAsHours(Math.max(afterMinutes, 0))}
                    </span>
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || cancelling || selectionOverlaps}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting
                ? dict.confirming
                : selection.bookingId
                  ? reservarDict.saveChanges
                  : reservarDict.confirmBooking}
            </button>

            {selection.bookingId && (
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={submitting || cancelling}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                {cancelling ? bookingDict.cancelling : bookingDict.cancel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
