import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

const EMPTY_COMPANY = {
  name: "",
  tax_id: "",
  address: "",
  city: "",
  postal_code: "",
  province: "",
  country: "",
  billing_email: "",
  holded_contact_id: "",
  notes: "",
};

export default async function NewCompanyPage() {
  const dict = getDictionary(await getLocale());
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link href="/admin/empresas" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.admin.companies.back}
      </Link>
      <h1 className="text-2xl font-bold text-ink">{dict.admin.companies.newCompany}</h1>
      <CompanyForm id={null} initial={EMPTY_COMPANY} />
    </div>
  );
}
