"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markPackageCollected } from "@/app/admin/paquetes/actions";

interface MarkCollectedButtonProps {
  packageId: string;
  label: string;
}

export function MarkCollectedButton({ packageId, label }: MarkCollectedButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await markPackageCollected(packageId);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-lg bg-cream px-3 py-1.5 text-xs font-medium text-brown-dark disabled:opacity-60"
    >
      {label}
    </button>
  );
}
