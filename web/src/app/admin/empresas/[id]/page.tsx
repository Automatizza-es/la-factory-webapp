import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const supabase = await createClient();
  const [{ data: company }, { data: people }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, tax_id, address, city, postal_code, province, country, billing_email, holded_contact_id, notes")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("contacts").select("id, first_name, last_name").eq("billing_company_id", id).order("first_name"),
  ]);
  if (!company) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link href="/admin/empresas" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.admin.companies.back}
      </Link>
      <h1 className="text-2xl font-bold text-ink">{company.name}</h1>
      <CompanyForm
        id={company.id}
        initial={{
          name: company.name ?? "",
          tax_id: company.tax_id ?? "",
          address: company.address ?? "",
          city: company.city ?? "",
          postal_code: company.postal_code ?? "",
          province: company.province ?? "",
          country: company.country ?? "",
          billing_email: company.billing_email ?? "",
          holded_contact_id: company.holded_contact_id ?? "",
          notes: company.notes ?? "",
        }}
      />
      {(people ?? []).length > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-ink">{dict.admin.companies.people((people ?? []).length)}</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {(people ?? []).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/coworkers/${p.id}`} className="text-brown-dark hover:underline">
                  {`${p.first_name} ${p.last_name ?? ""}`.trim()}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
