"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateIncident } from "@/app/admin/incidencias/actions";
import type { IncidentStatus } from "@/lib/data/incidents";
import { useI18n } from "@/lib/i18n/context";

const STATUSES: IncidentStatus[] = ["pending", "in_progress", "resolved"];

export function AdminIncidentControls({
  incidentId,
  status,
  note,
}: {
  incidentId: string;
  status: IncidentStatus;
  note: string | null;
}) {
  const { dict } = useI18n();
  const t = dict.incidents;
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [text, setText] = useState(note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const result = await updateIncident(incidentId, value, text);
    setBusy(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 border-t border-sand/30 pt-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              value === s ? "border-brown-dark bg-brown-dark text-white" : "border-sand bg-white text-ink"
            }`}
          >
            {t.status[s]}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.notePlaceholder}
        aria-label={t.notePlaceholder}
        className="w-full resize-y rounded-xl border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brown-dark"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || (value === status && text === (note ?? ""))}
        className="self-end rounded-xl bg-brown-dark px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {t.save}
      </button>
    </div>
  );
}
