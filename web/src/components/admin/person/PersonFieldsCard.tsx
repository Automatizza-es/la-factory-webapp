"use client";

import { useState, type FormEvent } from "react";
import { updatePerson, type PersonPatch } from "@/app/admin/coworkers/[id]/actions";
import { useI18n } from "@/lib/i18n/context";

export interface PersonField {
  key: keyof PersonPatch;
  label: string;
  kind?: "text" | "tel" | "textarea" | "select";
  options?: { value: string; label: string }[];
  // Span both columns on wide screens.
  wide?: boolean;
}

export const personInputClass =
  "w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brown-dark";

// A block of plain fields on the admin's person file, saved together.
export function PersonFieldsCard({
  contactId,
  title,
  fields,
  initial,
  children,
}: {
  contactId: string;
  title: string;
  fields: PersonField[];
  initial: Record<string, string>;
  // Extra read-only content shown above the fields.
  children?: React.ReactNode;
}) {
  const t = useI18n().dict.admin.userDetail;
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    const patch: PersonPatch = {};
    for (const f of fields) patch[f.key] = values[f.key] ?? "";
    const result = await updatePerson(contactId, patch);
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("saved");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-ink">{title}</h2>
      {children}
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const common = {
            id: `${contactId}-${f.key}`,
            value: values[f.key] ?? "",
            className: personInputClass,
          };
          const onChange = (value: string) => {
            setValues((v) => ({ ...v, [f.key]: value }));
            setStatus("idle");
          };
          return (
            <div key={f.key} className={`flex flex-col gap-1 ${f.wide || f.kind === "textarea" ? "sm:col-span-2" : ""}`}>
              <label htmlFor={common.id} className="text-xs font-medium text-warm-gray">
                {f.label}
              </label>
              {f.kind === "textarea" ? (
                <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} className={`${personInputClass} resize-y`} />
              ) : f.kind === "select" ? (
                <select {...common} onChange={(e) => onChange(e.target.value)}>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...common} type={f.kind ?? "text"} onChange={(e) => onChange(e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-end gap-3">
        {status === "saved" && <span className="text-sm text-emerald-700">{t.saved}</span>}
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-xl bg-brown-dark px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "saving" ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}
