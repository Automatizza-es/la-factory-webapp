"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { saveCompany, type CompanyInput } from "@/app/admin/empresas/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import { useI18n } from "@/lib/i18n/context";

export function CompanyForm({ id, initial }: { id: string | null; initial: CompanyInput }) {
  const { dict } = useI18n();
  const t = dict.admin.companies;
  const u = dict.admin.userDetail;
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const fields: { key: keyof CompanyInput; label: string; wide?: boolean; textarea?: boolean }[] = [
    { key: "name", label: `${t.name} *`, wide: true },
    { key: "tax_id", label: t.taxId },
    { key: "billing_email", label: t.billingEmail },
    { key: "address", label: u.address, wide: true },
    { key: "city", label: u.city },
    { key: "postal_code", label: u.postalCode },
    { key: "province", label: u.province },
    { key: "country", label: u.country },
    { key: "holded_contact_id", label: u.holdedId, wide: true },
    { key: "notes", label: t.notes, textarea: true },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    const result = await saveCompany(id, values);
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    if (!id && result.id) {
      router.push(`/admin/empresas/${result.id}`);
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={`flex flex-col gap-1 ${f.wide || f.textarea ? "sm:col-span-2" : ""}`}>
            <label htmlFor={`company-${f.key}`} className="text-xs font-medium text-warm-gray">
              {f.label}
            </label>
            {f.textarea ? (
              <textarea
                id={`company-${f.key}`}
                rows={3}
                value={values[f.key]}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [f.key]: e.target.value }));
                  setStatus("idle");
                }}
                className={`${personInputClass} resize-y`}
              />
            ) : (
              <input
                id={`company-${f.key}`}
                value={values[f.key]}
                required={f.key === "name"}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [f.key]: e.target.value }));
                  setStatus("idle");
                }}
                className={personInputClass}
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-end gap-3">
        {status === "saved" && <span className="text-sm text-emerald-700">{u.saved}</span>}
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-xl bg-brown-dark px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "saving" ? u.saving : u.save}
        </button>
      </div>
    </form>
  );
}
