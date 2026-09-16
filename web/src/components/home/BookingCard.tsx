"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Trash2, XCircle } from "lucide-react";
import { cancelBooking } from "@/app/(coworker)/reservar/actions";
import { formatDateLong, formatDateShort, formatTimeRange } from "@/lib/format";
import type { Booking } from "@/types/domain";

interface BookingCardProps {
  booking: Booking;
}

const STATUS_LABEL: Record<Booking["status"], string> = {
  upcoming: "Próxima",
  completed: "Completada",
  cancelled: "Cancelada",
};

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { day, month } = formatDateShort(booking.date);
  const durationMinutes = booking.endMinutes - booking.startMinutes;

  async function handleCancel() {
    if (!window.confirm("¿Seguro que quieres cancelar esta reserva?")) return;

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

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex w-14 flex-col items-center rounded-xl bg-cream py-2 text-brown-dark">
          <span className="text-lg font-bold leading-none">{day}</span>
          <span className="text-[11px] font-medium">{month}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-ink">{booking.roomName}</p>
          <p className="text-sm text-warm-gray">{formatDateLong(booking.date)}</p>
          <p className="text-sm text-warm-gray">
            {formatTimeRange(booking.startMinutes, booking.endMinutes)} ({durationMinutes} min)
          </p>
        </div>
        {booking.status !== "upcoming" && (
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
            {STATUS_LABEL[booking.status]}
          </span>
        )}
      </div>

      {booking.status === "upcoming" && (
        <div className="mt-3 flex gap-2">
          <Link
            href={`/reservar?sala=${booking.roomId}&reserva=${booking.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cream py-2 text-sm font-medium text-brown-dark transition-colors hover:bg-sand/40"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Modificar
          </Link>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {cancelling ? "Cancelando..." : "Cancelar"}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
