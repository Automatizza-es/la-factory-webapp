import { IncidentForm } from "@/components/incidents/IncidentForm";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function NewIncidentPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;
  const dict = getDictionary(await getLocale());

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{dict.incidents.reportTitle}</h1>
      <IncidentForm contactId={current.contactId} />
    </div>
  );
}
