import { formatDateLong, formatDateShort, formatTimeRange } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Booking } from "@/types/domain";

interface AdminBookingRowProps {
  booking: Booking;
  locale: Locale;
  statusLabel: string;
}

export function AdminBookingRow({ booking, locale, statusLabel }: AdminBookingRowProps) {
  const { day, month } = formatDateShort(booking.date, locale);
  const durationMinutes = booking.endMinutes - booking.startMinutes;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex w-14 flex-col items-center rounded-xl bg-cream py-2 text-brown-dark">
        <span className="text-lg font-bold leading-none">{day}</span>
        <span className="text-[11px] font-medium">{month}</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-ink">{booking.roomName}</p>
        <p className="text-sm text-warm-gray">{formatDateLong(booking.date, locale)}</p>
        <p className="text-sm text-warm-gray">
          {formatTimeRange(booking.startMinutes, booking.endMinutes)} ({durationMinutes} min)
        </p>
      </div>
      <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brown-dark">
        {statusLabel}
      </span>
    </div>
  );
}
