"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignPlan, endPlan, setBillable, setSharedHours } from "@/app/admin/coworkers/[id]/actions";
import { personInputClass } from "@/components/admin/person/PersonFieldsCard";
import { Switch } from "@/components/admin/person/Switch";
import type { AdminCoworkerDetail } from "@/lib/data/admin";
import { formatDateLong } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { todayInMadrid } from "@/lib/timezone";

// Own plan (assign / end / billable) or, without one, shared hours.
export function PersonPlanCard({
  contactId,
  membership,
  sharedWith,
  plans,
  shareCandidates,
}: {
  contactId: string;
  membership: AdminCoworkerDetail["membership"];
  sharedWith: AdminCoworkerDetail["sharedWith"];
  plans: AdminCoworkerDetail["plans"];
  shareCandidates: AdminCoworkerDetail["shareCandidates"];
}) {
  const { dict, locale } = useI18n();
  const t = dict.admin.userDetail;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [startDate, setStartDate] = useState(todayInMadrid());
  const [endDate, setEndDate] = useState(todayInMadrid());

  const inForce = membership?.inForce ? membership : null;

  async function run(action: () => Promise<{ error: string | null }>) {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-ink">{t.sectionPlan}</h2>

      {inForce ? (
        <>
          <div>
            <p className="font-medium text-ink">{inForce.planLabel}</p>
            <p className="text-sm text-warm-gray">
              {t.since(formatDateLong(inForce.startDate, locale))}
              {inForce.endDate && ` · ${t.until(formatDateLong(inForce.endDate, locale))}`}
            </p>
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-sand/30 pt-3">
            <div>
              <p className="text-sm text-ink">{t.billable}</p>
              <p className="mt-0.5 text-xs text-warm-gray">{t.billableHint}</p>
            </div>
            <Switch
              checked={inForce.billable}
              disabled={busy}
              label={t.billable}
              onChange={(value) => run(() => setBillable(contactId, inForce.id, value))}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2 border-t border-sand/30 pt-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-warm-gray">
              {t.endDate}
              <input
                type="date"
                value={endDate}
                min={inForce.startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={personInputClass}
              />
            </label>
            <button
              type="button"
              disabled={busy || !endDate}
              onClick={() => run(() => endPlan(contactId, inForce.id, endDate))}
              className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 disabled:opacity-60"
            >
              {t.endPlan}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-warm-gray">{t.noPlan}</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-warm-gray">
              {t.plan}
              <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={personInputClass}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-warm-gray">
              {t.startDate}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={personInputClass}
              />
            </label>
            <button
              type="button"
              disabled={busy || !planId || !startDate}
              onClick={() => run(() => assignPlan(contactId, planId, startDate))}
              className="rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {t.assign}
            </button>
          </div>

          <div className="flex flex-col gap-1 border-t border-sand/30 pt-3">
            <label htmlFor={`${contactId}-share`} className="text-xs font-medium text-warm-gray">
              {t.sharedWith}
            </label>
            <select
              id={`${contactId}-share`}
              value={sharedWith?.contactId ?? ""}
              disabled={busy}
              onChange={(e) => run(() => setSharedHours(contactId, e.target.value || null))}
              className={personInputClass}
            >
              <option value="">{t.noShare}</option>
              {shareCandidates.map((c) => (
                <option key={c.contactId} value={c.contactId}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-warm-gray">{t.sharedHint}</p>
          </div>
        </>
      )}

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
