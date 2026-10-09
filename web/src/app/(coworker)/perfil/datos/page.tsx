import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MyProfileForm } from "@/components/profile/MyProfileForm";
import { getCurrentCoworker } from "@/lib/data/coworker";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function MyDetailsPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const dict = getDictionary(await getLocale());
  const supabase = await createClient();
  const { data: contact } = await supabase
    .from("contacts")
    .select("first_name, last_name, email, phone, company_name, preferred_locale, marketing_consent")
    .eq("id", current.contactId)
    .single();
  if (!contact) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link href="/perfil" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.notificationSettings.back}
      </Link>
      <h1 className="text-2xl font-bold text-ink">{dict.perfil.myDetails}</h1>
      <MyProfileForm
        email={contact.email ?? ""}
        newsletter={contact.marketing_consent}
        initial={{
          firstName: contact.first_name ?? "",
          lastName: contact.last_name ?? "",
          phone: contact.phone ?? "",
          company: contact.company_name ?? "",
          preferredLocale: (contact.preferred_locale as Locale) ?? "es",
        }}
      />
    </div>
  );
}
