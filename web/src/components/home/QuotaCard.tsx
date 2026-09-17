import { CalendarRange } from "lucide-react";
import { formatMinutesAsHours } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { QuotaSummary } from "@/types/domain";

interface QuotaCardProps {
  quota: QuotaSummary;
  dict: Dictionary["quota"];
}

export function QuotaCard({ quota, dict }: QuotaCardProps) {
  const availableMinutes = quota.totalMinutes - quota.usedMinutes;
  const usedRatio = Math.min(quota.usedMinutes / quota.totalMinutes, 1);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-warm-gray">{dict.currentPlan}</span>
        <span className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-brown-dark">
          <CalendarRange className="h-3.5 w-3.5" strokeWidth={2} />
          {quota.periodLabel}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-brown-dark">
        {quota.planLabel}
      </p>

      <p className="mt-4 text-3xl font-bold text-ink">
        {formatMinutesAsHours(availableMinutes)}
      </p>
      <p className="text-sm text-warm-gray">
        {dict.availableOf} {formatMinutesAsHours(quota.totalMinutes)}
      </p>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sand/50">
        <div
          className="h-full rounded-full bg-brown-dark"
          style={{ width: `${usedRatio * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-warm-gray">
        {formatMinutesAsHours(quota.usedMinutes)} {dict.usedThisMonth}
      </p>
    </section>
  );
}
