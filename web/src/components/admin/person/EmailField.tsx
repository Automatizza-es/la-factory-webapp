"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeEmail } from "@/app/admin/coworkers/[id]/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import { useI18n } from "@/lib/i18n/context";

// Email lives apart from the other personal fields: it's also their login,
// so it's changed on its own, explicitly.
export function EmailField({ contactId, email }: { contactId: string; email: string | null }) {
  const t = useI18n().dict.admin.userDetail;
  const router = useRouter();
  const [value, setValue] = useState(email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = value.trim().toLowerCase() !== (email ?? "").toLowerCase();

  async function save() {
    setBusy(true);
    setMessage(null);
    const result = await changeEmail(contactId, value);
    setBusy(false);
    if (result.error) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setMessage({ ok: true, text: t.emailChanged });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${contactId}-email`} className="text-xs font-medium text-warm-gray">
        {t.email}
      </label>
      <div className="flex gap-2">
        <input
          id={`${contactId}-email`}
          type="email"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setMessage(null);
          }}
          className={`${personInputClass} flex-1`}
        />
        <button
          type="button"
          onClick={save}
          disabled={busy || !changed}
          className="shrink-0 rounded-xl bg-cream px-3 py-2 text-sm font-medium text-brown-dark disabled:opacity-50"
        >
          {t.changeEmail}
        </button>
      </div>
      <p className="text-xs text-warm-gray">{t.emailHint}</p>
      {message && <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>}
    </div>
  );
}
