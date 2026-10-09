"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { adjustHours } from "@/app/admin/coworkers/[id]/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import { useI18n } from "@/lib/i18n/context";

export function QuotaAdjustForm({ contactId }: { contactId: string }) {
  const t = useI18n().dict.admin.coworkerDetail;
  const router = useRouter();
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(sign: 1 | -1) {
    const value = Number(hours.trim().replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setMessage({ ok: false, text: t.invalidHours });
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await adjustHours(contactId, sign * value, note);
    setBusy(false);
    if (result.error) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setHours("");
    setNote("");
    setMessage({ ok: true, text: t.hoursUpdated });
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <div>
        <h3 className="font-semibold text-ink">{t.adjustTitle}</h3>
        <p className="text-xs text-warm-gray">{t.adjustHint}</p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-warm-gray">
          {t.hours}
          <input
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="2"
            className={`${personInputClass} w-24`}
          />
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.reasonPlaceholder}
          aria-label={t.reasonPlaceholder}
          className={`${personInputClass} min-w-40 flex-1`}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(1)}
          className="flex items-center gap-1 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          {t.addHours}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(-1)}
          className="flex items-center gap-1 rounded-xl bg-cream px-4 py-2.5 text-sm font-medium text-brown-dark disabled:opacity-60"
        >
          <Minus className="h-4 w-4" strokeWidth={2.25} />
          {t.removeHours}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>
      )}
    </section>
  );
}
