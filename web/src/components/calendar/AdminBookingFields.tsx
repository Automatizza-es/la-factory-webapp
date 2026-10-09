"use client";

import type { AdminBookingFor, BookingPickerOption } from "@/lib/data/admin";
import { useI18n } from "@/lib/i18n/context";

export interface AdminBookingFieldsValue {
  bookingFor: AdminBookingFor;
  contactId: string;
  consumesQuota: boolean;
  guestName: string;
  notes: string;
}

export const EMPTY_ADMIN_BOOKING_FIELDS: AdminBookingFieldsValue = {
  bookingFor: "coworker",
  contactId: "",
  consumesQuota: true,
  guestName: "",
  notes: "",
};

const fieldClass =
  "w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brown-dark";

// The admin's "Reserva para" block inside the calendar's booking sheet.
export function AdminBookingFields({
  value,
  onChange,
  coworkers,
  guests,
}: {
  value: AdminBookingFieldsValue;
  onChange: (next: AdminBookingFieldsValue) => void;
  coworkers: BookingPickerOption[];
  guests: BookingPickerOption[];
}) {
  const t = useI18n().dict.admin.createBooking;
  const set = (patch: Partial<AdminBookingFieldsValue>) => onChange({ ...value, ...patch });

  const options: { key: AdminBookingFor; label: string }[] = [
    { key: "coworker", label: t.typeCoworker },
    { key: "external", label: t.typeExternal },
    { key: "guest", label: t.typeGuest },
    { key: "event", label: t.typeEvent },
    { key: "other", label: t.typeOther },
  ];
  const people = value.bookingFor === "coworker" ? coworkers : guests;
  const nameLabel =
    value.bookingFor === "external"
      ? t.nameLabel
      : value.bookingFor === "event"
        ? t.eventNameLabel
        : t.otherNameLabel;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-ink">{t.bookingFor}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => set({ bookingFor: o.key, contactId: "" })}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              value.bookingFor === o.key
                ? "border-brown-dark bg-brown-dark text-white"
                : "border-sand bg-white text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {(value.bookingFor === "coworker" || value.bookingFor === "guest") && (
        <select
          value={value.contactId}
          onChange={(e) => set({ contactId: e.target.value })}
          className={fieldClass}
        >
          <option value="">{t.chooseOne}</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {value.bookingFor === "coworker" && (
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.consumesQuota}
            onChange={(e) => set({ consumesQuota: e.target.checked })}
            className="h-4 w-4 rounded border-sand text-brown-dark focus:ring-brown-dark"
          />
          {t.consumesQuota}
        </label>
      )}

      {(value.bookingFor === "external" ||
        value.bookingFor === "event" ||
        value.bookingFor === "other") && (
        <input
          value={value.guestName}
          onChange={(e) => set({ guestName: e.target.value })}
          placeholder={nameLabel}
          aria-label={nameLabel}
          className={fieldClass}
        />
      )}

      <textarea
        value={value.notes}
        onChange={(e) => set({ notes: e.target.value })}
        placeholder={t.notesPlaceholder}
        aria-label={t.notesLabel}
        rows={2}
        className={`${fieldClass} resize-none`}
      />
    </div>
  );
}
