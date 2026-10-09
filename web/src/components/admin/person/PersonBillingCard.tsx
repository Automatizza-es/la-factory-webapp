"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { updatePerson } from "@/app/admin/coworkers/[id]/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import type { AdminCoworkerDetail } from "@/lib/data/admin";
import { useI18n } from "@/lib/i18n/context";

type Address = Pick<
  AdminCoworkerDetail["contact"],
  "address" | "city" | "postalCode" | "province" | "country"
>;

// Who the invoice goes to: the person (with their fiscal address) or one
// of the companies.
export function PersonBillingCard({
  contactId,
  billingCompanyId,
  address,
  companies,
}: {
  contactId: string;
  billingCompanyId: string | null;
  address: Address;
  companies: AdminCoworkerDetail["companies"];
}) {
  const { dict } = useI18n();
  const t = dict.admin.userDetail;
  const [billTo, setBillTo] = useState<"person" | "company">(billingCompanyId ? "company" : "person");
  const [companyId, setCompanyId] = useState(billingCompanyId ?? "");
  const [values, setValues] = useState({
    address: address.address ?? "",
    city: address.city ?? "",
    postal_code: address.postalCode ?? "",
    province: address.province ?? "",
    country: address.country ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    const result = await updatePerson(contactId, {
      ...values,
      billing_company_id: billTo === "company" && companyId ? companyId : null,
    });
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("saved");
  }

  const addressFields: { key: keyof typeof values; label: string; wide?: boolean }[] = [
    { key: "address", label: t.address, wide: true },
    { key: "city", label: t.city },
    { key: "postal_code", label: t.postalCode },
    { key: "province", label: t.province },
    { key: "country", label: t.country },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-ink">{t.sectionBilling}</h2>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-warm-gray">{t.billTo}</span>
        <div className="flex gap-2">
          {(["person", "company"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setBillTo(option);
                setStatus("idle");
              }}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                billTo === option ? "border-brown-dark bg-cream text-brown-dark" : "border-sand bg-white text-ink"
              }`}
            >
              {option === "person" ? t.billToPerson : t.billToCompany}
            </button>
          ))}
        </div>
      </div>

      {billTo === "company" ? (
        <div className="flex flex-col gap-1">
          <select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setStatus("idle");
            }}
            className={personInputClass}
            aria-label={t.chooseCompany}
          >
            <option value="">{t.chooseCompany}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Link href="/admin/empresas" className="text-xs font-medium text-brown-dark">
            {t.manageCompanies}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addressFields.map((f) => (
            <div key={f.key} className={`flex flex-col gap-1 ${f.wide ? "sm:col-span-2" : ""}`}>
              <label htmlFor={`${contactId}-${f.key}`} className="text-xs font-medium text-warm-gray">
                {f.label}
              </label>
              <input
                id={`${contactId}-${f.key}`}
                value={values[f.key]}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [f.key]: e.target.value }));
                  setStatus("idle");
                }}
                className={personInputClass}
              />
            </div>
          ))}
        </div>
      )}

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
