"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setInvoiced } from "@/app/admin/facturacion/actions";

export function InvoicedCheckbox({
  membershipId,
  month,
  invoiced,
  label,
}: {
  membershipId: string;
  month: string;
  invoiced: boolean;
  label: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(invoiced);
  const [busy, setBusy] = useState(false);

  async function toggle(value: boolean) {
    setBusy(true);
    setChecked(value);
    const result = await setInvoiced(membershipId, month, value);
    setBusy(false);
    if (result.error) {
      setChecked(!value);
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={busy}
      aria-label={label}
      onChange={(e) => toggle(e.target.checked)}
      className="h-5 w-5 rounded border-sand text-brown-dark focus:ring-brown-dark disabled:opacity-60"
    />
  );
}
