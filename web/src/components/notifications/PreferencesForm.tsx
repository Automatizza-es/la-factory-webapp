"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/app/(coworker)/perfil/notificaciones/actions";
import { useI18n } from "@/lib/i18n/context";

interface PreferencesFormProps {
  initial: {
    bookingReminders: boolean;
    packages: boolean;
    events: boolean;
  };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-3">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brown-dark" : "bg-sand"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export function PreferencesForm({ initial }: PreferencesFormProps) {
  const { dict } = useI18n();
  const t = dict.notificationSettings;

  const [bookingReminders, setBookingReminders] = useState(initial.bookingReminders);
  const [packages, setPackages] = useState(initial.packages);
  const [events, setEvents] = useState(initial.events);
  const [saved, setSaved] = useState(false);

  async function persist(next: { bookingReminders: boolean; packages: boolean; events: boolean }) {
    setSaved(false);
    const result = await updateNotificationPreferences(next);
    if (!result.error) setSaved(true);
  }

  return (
    <div className="flex flex-col divide-y divide-sand/40">
      <Toggle
        checked={bookingReminders}
        label={t.bookingReminders}
        onChange={(value) => {
          setBookingReminders(value);
          persist({ bookingReminders: value, packages, events });
        }}
      />
      <Toggle
        checked={packages}
        label={t.packages}
        onChange={(value) => {
          setPackages(value);
          persist({ bookingReminders, packages: value, events });
        }}
      />
      <Toggle
        checked={events}
        label={t.events}
        onChange={(value) => {
          setEvents(value);
          persist({ bookingReminders, packages, events: value });
        }}
      />
      {saved && <p className="pt-2 text-xs text-warm-gray">{t.saved}</p>}
    </div>
  );
}
