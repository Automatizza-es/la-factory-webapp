import { NewCoworkerForm } from "@/components/admin/NewCoworkerForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function NewCoworkerPage() {
  const dict = getDictionary(await getLocale());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.newCoworker.title}</h1>
        <p className="text-sm text-warm-gray">{dict.admin.newCoworker.subtitle}</p>
      </div>

      <div className="max-w-md rounded-3xl bg-white p-5 shadow-sm">
        <NewCoworkerForm dict={dict.admin.newCoworker} />
      </div>
    </div>
  );
}
