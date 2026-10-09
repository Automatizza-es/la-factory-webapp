import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCompaniesPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.admin.companies;
  const supabase = await createClient();
  const [{ data: companies }, { data: billed }] = await Promise.all([
    supabase.from("companies").select("id, name, tax_id").order("name"),
    supabase.from("contacts").select("billing_company_id").not("billing_company_id", "is", null),
  ]);

  const peopleByCompany = new Map<string, number>();
  for (const row of billed ?? []) {
    const id = row.billing_company_id as string;
    peopleByCompany.set(id, (peopleByCompany.get(id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
          <p className="text-sm text-warm-gray">{t.subtitle}</p>
        </div>
        <Link
          href="/admin/empresas/nueva"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t.newCompany}
        </Link>
      </div>

      {(companies ?? []).length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">{t.noCompanies}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(companies ?? []).map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/empresas/${c.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-sand/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-warm-gray">
                    {[c.tax_id, t.people(peopleByCompany.get(c.id) ?? 0)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-warm-gray" strokeWidth={2} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
