"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelEvent } from "@/app/admin/eventos/actions";

interface CancelEventButtonProps {
  eventId: string;
  label: string;
  confirmLabel: string;
}

export function CancelEventButton({ eventId, label, confirmLabel }: CancelEventButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmLabel)) return;
    setBusy(true);
    await cancelEvent(eventId);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
