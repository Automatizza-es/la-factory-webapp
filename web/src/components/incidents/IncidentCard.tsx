"use client";

import Image from "next/image";
import type { IncidentItem, IncidentStatus } from "@/lib/data/incidents";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

export const STATUS_STYLE: Record<IncidentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-sky-50 text-sky-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

// One incident: category, status, description, photo, La Factory's note,
// and (admin view) who reported it. `children` holds the admin controls.
export function IncidentCard({ incident, children }: { incident: IncidentItem; children?: React.ReactNode }) {
  const { dict, locale } = useI18n();
  const t = dict.incidents;
  const when = utcIsoToZonedDateAndMinutes(incident.createdAt);

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{t.categories[incident.category]}</p>
          <p className="text-xs text-warm-gray">
            {formatDateLong(when.date, locale)} · {minutesToTime(when.minutes)}
            {incident.reporterName && ` · ${t.reportedBy} ${incident.reporterName}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[incident.status]}`}>
          {t.status[incident.status]}
        </span>
      </div>
      <p className="whitespace-pre-line text-sm text-ink">{incident.description}</p>
      {incident.imageUrl && (
        <a href={incident.imageUrl} target="_blank" rel="noopener noreferrer" className="relative block h-40 w-full overflow-hidden rounded-xl bg-sand/40 sm:w-64">
          <Image src={incident.imageUrl} alt="" fill className="object-cover" unoptimized />
        </a>
      )}
      {incident.adminNote && !children && (
        <div className="rounded-xl bg-cream p-3 text-sm">
          <p className="text-xs font-medium text-warm-gray">{t.adminNote}</p>
          <p className="text-ink">{incident.adminNote}</p>
        </div>
      )}
      {children}
    </article>
  );
}
