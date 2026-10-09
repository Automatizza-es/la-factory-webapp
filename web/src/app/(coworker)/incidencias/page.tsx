import Link from "next/link";
import { Plus } from "lucide-react";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getIncidentsForMember } from "@/lib/data/incidents";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function IncidentsPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const dict = getDictionary(await getLocale());
  const t = dict.incidents;
  const supabase = await createClient();
  const { open, mine } = await getIncidentsForMember(supabase, current.contactId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
          <p className="text-sm text-warm-gray">{t.subtitle}</p>
        </div>
        <Link
          href="/incidencias/nueva"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t.report}
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{t.openTitle}</h2>
          <p className="text-xs text-warm-gray">{t.openHint}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {open.length === 0 ? (
            <p className="col-span-full rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">{t.noneOpen}</p>
          ) : (
            open.map((incident) => <IncidentCard key={incident.id} incident={incident} />)
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{t.mineTitle}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {mine.length === 0 ? (
            <p className="col-span-full rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">{t.noneMine}</p>
          ) : (
            mine.map((incident) => <IncidentCard key={incident.id} incident={incident} />)
          )}
        </div>
      </section>
    </div>
  );
}
