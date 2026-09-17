"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminBooking, type AdminBookingType } from "@/app/admin/reservar/actions";
import type { AdminContact, AdminCoworkerRow, AdminRoom } from "@/lib/data/admin";
import { useI18n } from "@/lib/i18n/context";

interface AdminBookingFormProps {
  rooms: AdminRoom[];
  coworkers: AdminCoworkerRow[];
  contacts: AdminContact[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminBookingForm({ rooms, coworkers, contacts }: AdminBookingFormProps) {
  const router = useRouter();
  const { dict } = useI18n();
  const [bookingType, setBookingType] = useState<AdminBookingType>("coworker");
  const [contactId, setContactId] = useState("");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [consumesQuota, setConsumesQuota] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const needsContact = bookingType === "coworker" || bookingType === "guest";
  const contactOptions: { id: string; label: string }[] =
    bookingType === "coworker"
      ? coworkers.map((c) => ({ id: c.contactId, label: `${c.firstName} ${c.lastName ?? ""}`.trim() }))
      : contacts.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName ?? ""}`.trim() }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await createAdminBooking({
      bookingType,
      roomId,
      date,
      startTime,
      endTime,
      contactId: needsContact ? contactId : undefined,
      consumesQuota,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1 text-sm text-warm-gray">
          {dict.admin.createBooking.type}
          <select
            value={bookingType}
            onChange={(e) => {
              setBookingType(e.target.value as AdminBookingType);
              setContactId("");
              setConsumesQuota(e.target.value === "coworker");
            }}
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          >
            <option value="coworker">{dict.admin.createBooking.typeCoworker}</option>
            <option value="guest">{dict.admin.createBooking.typeGuest}</option>
            <option value="internal">{dict.admin.createBooking.typeInternal}</option>
            <option value="event">{dict.admin.createBooking.typeEvent}</option>
          </select>
        </label>

        {needsContact && (
          <label className="mt-3 flex flex-col gap-1 text-sm text-warm-gray">
            {bookingType === "coworker"
              ? dict.admin.createBooking.coworkerLabel
              : dict.admin.createBooking.contactLabel}
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              required
              className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
            >
              <option value="" disabled>
                {dict.admin.createBooking.chooseOne}
              </option>
              {contactOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {bookingType === "coworker" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={consumesQuota}
              onChange={(e) => setConsumesQuota(e.target.checked)}
              className="h-4 w-4 rounded border-sand"
            />
            {dict.admin.createBooking.consumesQuota}
          </label>
        )}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1 text-sm text-warm-gray">
          {dict.admin.createBooking.room}
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            className="rounded-xl border border-sand bg-white px-3 py-2 text-ink outline-none focus:border-brown-dark"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-warm-gray">
            {dict.reservar.day}
            <input
              type="date"
              value={date}
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

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="rounded-2xl bg-sand/30 p-3 text-sm text-brown-dark">
          {dict.admin.createBooking.success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? dict.admin.createBooking.submitting : dict.admin.createBooking.submit}
      </button>
    </form>
  );
}
