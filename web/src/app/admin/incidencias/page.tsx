import Link from "next/link";
import { AdminIncidentControls } from "@/components/incidents/AdminIncidentControls";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getAdminIncidents, type AdminIncidentFilter } from "@/lib/data/incidents";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ filtro?: string }>;
}

const FILTERS: AdminIncidentFilter[] = ["open", "resolved", "all"];

export default async function AdminIncidentsPage({ searchParams }: PageProps) {
  const { filtro } = await searchParams;
  const filter: AdminIncidentFilter = FILTERS.includes(filtro as AdminIncidentFilter)
    ? (filtro as AdminIncidentFilter)
    : "open";

  const current = await getCurrentCoworker();
  if (!current) return null;
  const dict = getDictionary(await getLocale());
  const t = dict.incidents;
  const supabase = await createClient();
  const incidents = await getAdminIncidents(supabase, current.contactId, filter);
  const label: Record<AdminIncidentFilter, string> = {
    open: t.filterOpen,
    resolved: t.filterResolved,
    all: t.filterAll,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "open" ? "/admin/incidencias" : `/admin/incidencias?filtro=${f}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === f ? "bg-brown-dark text-white" : "bg-white text-warm-gray shadow-sm"
            }`}
          >
            {label[f]}
          </Link>
        ))}
      </div>
      {incidents.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">{t.none}</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident}>
              <AdminIncidentControls incidentId={incident.id} status={incident.status} note={incident.adminNote} />
            </IncidentCard>
          ))}
        </div>
      )}
    </div>
  );
}
