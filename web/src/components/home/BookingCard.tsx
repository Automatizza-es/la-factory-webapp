"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Trash2, X, XCircle } from "lucide-react";
import { cancelBooking } from "@/app/(coworker)/reservar/actions";
import { formatDateLong, formatDateShort, formatMinutesAsHours, formatTimeRange } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { Booking } from "@/types/domain";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const { day, month } = formatDateShort(booking.date, locale);
  const durationMinutes = booking.endMinutes - booking.startMinutes;
  const isHistory = booking.status !== "upcoming";

  const statusLabel = {
    upcoming: dict.booking.statusUpcoming,
    completed: dict.booking.statusCompleted,
    cancelled: dict.booking.statusCancelled,
  }[booking.status];

  async function handleCancel() {
    if (!window.confirm(dict.booking.confirmCancel)) return;

    setCancelling(true);
    setError(null);
    const result = await cancelBooking(booking.id);

    if (result.error) {
      setError(result.error);
      setCancelling(false);
      return;
    }

    router.refresh();
  }

  const header = (
    <div className="flex items-start gap-3">
      <div className="flex w-14 flex-col items-center rounded-xl bg-cream py-2 text-brown-dark">
        <span className="text-lg font-bold leading-none">{day}</span>
        <span className="text-[11px] font-medium">{month}</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-ink">{booking.roomName}</p>
        <p className="text-sm text-warm-gray">{formatDateLong(booking.date, locale)}</p>
        <p className="text-sm text-warm-gray">
          {formatTimeRange(booking.startMinutes, booking.endMinutes)} ({durationMinutes}{" "}
          {dict.booking.minutesShort})
        </p>
      </div>
      {isHistory && (
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            booking.status === "completed"
              ? "bg-sand/50 text-brown-dark"
              : "bg-red-50 text-red-600"
          }`}
        >
          {booking.status === "completed" ? (
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          {statusLabel}
        </span>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {isHistory ? (
        <button type="button" onClick={() => setDetailOpen(true)} className="w-full text-left">
          {header}
        </button>
      ) : (
        header
      )}

      {booking.status === "upcoming" && (
        <div className="mt-3 flex gap-2">
          <Link
            href={`/reservar?sala=${booking.roomId}&reserva=${booking.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cream py-2 text-sm font-medium text-brown-dark transition-colors hover:bg-sand/40"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            {dict.booking.modify}
          </Link>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {cancelling ? dict.booking.cancelling : dict.booking.cancel}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {detailOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDetailOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-t-3xl bg-white pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-xl">
            <div className="relative h-40 w-full bg-sand/50">
              {booking.roomImagePath && (
                <Image
                  src={booking.roomImagePath}
                  alt={booking.roomName}
                  fill
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
              >
                <X className="h-4 w-4 text-ink" strokeWidth={2} />
              </button>
              <span
                className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  booking.status === "completed"
                    ? "bg-white/90 text-brown-dark"
                    : "bg-red-50/95 text-red-600"
                }`}
              >
                {booking.status === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {statusLabel}
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-ink">{booking.roomName}</h3>
              <p className="mt-1 text-sm text-warm-gray">{formatDateLong(booking.date, locale)}</p>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl bg-cream p-4 text-sm">
                <span className="text-warm-gray">{dict.reservar.start}</span>
                <span className="text-ink">{formatTimeRange(booking.startMinutes, booking.endMinutes)}</span>
                <span className="text-warm-gray">{dict.reservar.duration}</span>
                <span className="text-ink">{formatMinutesAsHours(durationMinutes)}</span>
              </div>

              <Link
                href={`/calendario?fecha=${booking.date}&sala=${booking.roomId}`}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white"
              >
                {dict.home.viewCalendar}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
