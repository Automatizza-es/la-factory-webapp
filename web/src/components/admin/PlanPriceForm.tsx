"use client";

import { useState, type FormEvent } from "react";
import { setPlanPrice } from "@/app/admin/configuracion/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import { useI18n } from "@/lib/i18n/context";

export function PlanPriceForm({ planId, price }: { planId: string; price: number | null }) {
  const { dict } = useI18n();
  const u = dict.admin.userDetail;
  const [value, setValue] = useState(price === null ? "" : String(price));
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    // Accept "150,50" as well as "150.50".
    const normalized = value.trim().replace(",", ".");
    const result = await setPlanPrice(planId, normalized === "" ? null : Number(normalized));
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("saved");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs font-medium text-warm-gray">
        {dict.admin.settings.price}
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus("idle");
          }}
          className={`${personInputClass} w-36`}
        />
      </label>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === "saving" ? u.saving : u.save}
      </button>
      {status === "saved" && <span className="pb-2.5 text-sm text-emerald-700">{u.saved}</span>}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
