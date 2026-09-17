"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitBooking } from "@/app/(coworker)/reservar/actions";
import { defaultEndTime, defaultStartTime, formatDateLong, formatMinutesAsHours } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { QuotaSummary, Room } from "@/types/domain";

interface BookingFormProps {
  room: Room;
  quota: QuotaSummary | null;
  existingBookingId?: string;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function BookingForm({
  room,
  quota,
  existingBookingId,
  initialDate,
  initialStartTime,
  initialEndTime,
}: BookingFormProps) {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const [date, setDate] = useState(initialDate ?? todayIso());
  const [startTime, setStartTime] = useState(initialStartTime ?? defaultStartTime());
  const [endTime, setEndTime] = useState(initialEndTime ?? defaultEndTime(startTime));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationMinutes = toMinutes(endTime) - toMinutes(startTime);
  const isValidRange = durationMinutes > 0;

  const availableMinutes = quota ? quota.totalMinutes - quota.usedMinutes : null;
  const afterMinutes = useMemo(() => {
    if (availableMinutes === null || !isValidRange) return null;
    return availableMinutes - durationMinutes;
  }, [availableMinutes, durationMinutes, isValidRange]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidRange) return;

    setSubmitting(true);
    setError(null);

    const result = await submitBooking({
      roomId: room.id,
      date,
      startTime,
      endTime,
      existingBookingId,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/reservas");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-ink">{room.name}</p>
        <p className="text-sm text-warm-gray">
          {room.capacityMin}–{room.capacityMax} {dict.room.people}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-warm-gray">
            {dict.reservar.day}
            <input
              type="date"
              value={date}
              min={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-warm-gray">
              {dict.reservar.start}
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-warm-gray">
              {dict.reservar.end}
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm text-warm-gray">{formatDateLong(date, locale)}</p>
        {isValidRange ? (
          <p className="mt-1 text-lg font-semibold text-ink">
            {startTime}–{endTime} · {dict.reservar.duration}:{" "}
            {formatMinutesAsHours(durationMinutes)}
          </p>
        ) : (
          <p className="mt-1 text-sm text-red-600">{dict.reservar.invalidRange}</p>
        )}

        {availableMinutes !== null && (
          <div className="mt-4 flex flex-col gap-1 border-t border-sand/50 pt-3 text-sm">
            <div className="flex justify-between text-warm-gray">
              <span>{dict.reservar.availableNow}</span>
              <span className="font-medium text-ink">
                {formatMinutesAsHours(availableMinutes)}
              </span>
            </div>
            {afterMinutes !== null && (
              <div className="flex justify-between text-warm-gray">
                <span>{dict.reservar.afterBooking}</span>
                <span
                  className={`font-medium ${afterMinutes < 0 ? "text-red-600" : "text-ink"}`}
                >
                  {formatMinutesAsHours(Math.max(afterMinutes, 0))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isValidRange || submitting}
        className="rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting
          ? dict.reservar.submitting
          : existingBookingId
            ? dict.reservar.saveChanges
            : dict.reservar.confirmBooking}
      </button>
    </form>
  );
}
