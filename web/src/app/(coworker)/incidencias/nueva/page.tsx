import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
      <Link href="/incidencias" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.incidents.title}
      </Link>
      <h1 className="text-2xl font-bold text-ink">{dict.incidents.reportTitle}</h1>
      <IncidentForm contactId={current.contactId} />
    </div>
  );
}
