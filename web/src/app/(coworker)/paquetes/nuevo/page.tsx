import { getCurrentCoworker } from "@/lib/data/coworker";
import { PackageForm } from "@/components/packages/PackageForm";
import { getActiveContactsForPicker } from "@/lib/data/packages";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function NewPackagePage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const dict = getDictionary(await getLocale());
  const supabase = await createClient();
  const contacts = await getActiveContactsForPicker(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.newPackageForm.title}</h1>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <PackageForm contacts={contacts} redirectTo="/paquetes" />
      </div>
    </div>
  );
}
