"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cancelEventRegistration, registerForEvent } from "@/app/(coworker)/eventos/actions";
import { useI18n } from "@/lib/i18n/context";

interface EventRegisterButtonProps {
  eventId: string;
  isRegistered: boolean;
  isFull: boolean;
  isClosed: boolean;
  isCancelled: boolean;
}

export function EventRegisterButton({
  eventId,
  isRegistered,
  isFull,
  isClosed,
  isCancelled,
}: EventRegisterButtonProps) {
  const router = useRouter();
  const { dict: fullDict } = useI18n();
  const dict = fullDict.events;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setBusy(true);
    setError(null);
    const result = await registerForEvent(eventId);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleCancel() {
    if (!window.confirm(dict.cancelConfirm)) return;
    setBusy(true);
    setError(null);
    const result = await cancelEventRegistration(eventId);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (isCancelled) return null;

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          {dict.joined}
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={busy}
          className="rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 disabled:opacity-60"
        >
          {busy ? dict.cancelling : dict.cancelAttendance}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRegister}
        disabled={busy || isFull || isClosed}
        className="rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? dict.joining : isFull ? dict.full : isClosed ? dict.registrationClosed : dict.join}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
