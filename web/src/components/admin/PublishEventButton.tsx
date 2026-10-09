"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishEvent } from "@/app/admin/eventos/actions";

export function PublishEventButton({
  eventId,
  label,
  confirmLabel,
}: {
  eventId: string;
  label: string;
  confirmLabel: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmLabel)) return;
    setBusy(true);
    const result = await publishEvent(eventId);
    setBusy(false);
    if (result.error) window.alert(result.error);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-lg bg-brown-dark px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
    >
      {label}
    </button>
  );
}
