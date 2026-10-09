import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { InvoicedCheckbox } from "@/components/admin/InvoicedCheckbox";
import { getBillingMonth, type BillingIssue, type BillingLine } from "@/lib/data/billing";
import { formatDateLong, formatEuros, formatMonthYear } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { todayInMadrid } from "@/lib/timezone";

interface PageProps {
  searchParams: Promise<{ mes?: string }>;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminBillingPage({ searchParams }: PageProps) {
  const { mes } = await searchParams;
  const month = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : todayInMadrid().slice(0, 7);

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.admin.billing;
  const supabase = await createClient();
  const data = await getBillingMonth(supabase, month);
  const monthLabel = formatMonthYear(month, locale);

  const issueLabel = (issue: BillingIssue, line: BillingLine) =>
    ({
      no_price: t.noPrice,
      no_tax_id: t.noTaxId,
      no_address: t.noAddress,
      no_holded_id: t.noHoldedId,
      starts_mid_month: t.startsMidMonth(formatDateLong(line.startDate, locale)),
      ends_mid_month: t.endsMidMonth(formatDateLong(line.endDate ?? line.startDate, locale)),
    })[issue];
  const missingPrices = data.billable.some((l) => l.issues.includes("no_price"));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
          <p className="text-sm text-warm-gray">{t.subtitle(monthLabel)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/facturacion?mes=${shiftMonth(month, -1)}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
          <span className="min-w-36 rounded-full bg-white px-4 py-2 text-center text-sm font-medium capitalize text-ink shadow-sm">
            {monthLabel}
          </span>
          <Link
            href={`/admin/facturacion?mes=${shiftMonth(month, 1)}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-ink" strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-warm-gray">{t.total}</p>
          <p className="text-2xl font-bold text-ink">{formatEuros(data.totalExpected, locale)}</p>
          {missingPrices && (
            <Link href="/admin/configuracion" className="text-xs font-medium text-brown-dark">
              {t.noPrice} · {t.setPrices}
            </Link>
          )}
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-warm-gray">{t.invoiced}</p>
          <p className="text-2xl font-bold text-ink">{t.progress(data.invoicedCount, data.billable.length)}</p>
        </div>
      </div>

      {data.billable.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">{t.noLines}</p>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand/50 text-warm-gray">
                  <th className="px-5 py-3 font-medium">{t.invoiced}</th>
                  <th className="px-5 py-3 font-medium">{t.billTo}</th>
                  <th className="px-5 py-3 font-medium">{t.person}</th>
                  <th className="px-5 py-3 font-medium">{t.plan}</th>
                  <th className="px-5 py-3 text-right font-medium">{t.amount}</th>
                  <th className="px-5 py-3 font-medium">{t.issues}</th>
                </tr>
              </thead>
              <tbody>
                {data.billable.map((line) => (
                  <tr
                    key={line.membershipId}
                    className={`border-b border-sand/30 last:border-0 ${line.invoiced ? "bg-cream/40" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <InvoicedCheckbox
                        membershipId={line.membershipId}
                        month={month}
                        invoiced={line.invoiced}
                        label={`${t.invoiced}: ${line.billTo.name}`}
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">
                      {line.billTo.companyId ? (
                        <Link href={`/admin/empresas/${line.billTo.companyId}`} className="hover:underline">
                          {line.billTo.name}
                        </Link>
                      ) : (
                        line.billTo.name
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/coworkers/${line.contactId}`} className="text-brown-dark hover:underline">
                        {line.personName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink">{line.planName}</td>
                    <td className="px-5 py-3 text-right text-ink">
                      {line.price === null ? "—" : formatEuros(line.price, locale)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {line.issues.map((issue) => (
                          <span
                            key={issue}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              issue === "starts_mid_month" || issue === "ends_mid_month"
                                ? "bg-cream text-brown-dark"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {issue !== "starts_mid_month" && issue !== "ends_mid_month" && (
                              <AlertTriangle className="h-3 w-3" strokeWidth={2.25} />
                            )}
                            {issueLabel(issue, line)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.notBillable.length > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-ink">{t.notBillableTitle}</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {data.notBillable.map((line) => (
              <li key={line.membershipId} className="flex items-center justify-between gap-3">
                <Link href={`/admin/coworkers/${line.contactId}`} className="text-brown-dark hover:underline">
                  {line.personName}
                </Link>
                <span className="text-warm-gray">{line.planName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
