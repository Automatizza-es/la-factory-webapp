import Link from "next/link";
import { getAllCoworkers } from "@/lib/data/admin";
import { formatMinutesAsHours } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-sand/50 text-brown-dark",
  ended: "bg-cream text-warm-gray",
  cancelled: "bg-red-50 text-red-600",
  none: "bg-cream text-warm-gray",
};

export default async function AdminCoworkersPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const coworkers = await getAllCoworkers(supabase, locale);

  const statusLabel: Record<string, string> = {
    active: dict.admin.coworkers.statusActive,
    ended: dict.admin.coworkers.statusEnded,
    cancelled: dict.admin.coworkers.statusCancelled,
    none: dict.admin.coworkers.statusNone,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.coworkers.title}</h1>
        <p className="text-sm text-warm-gray">{dict.admin.coworkers.subtitle}</p>
      </div>

      {coworkers.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
          {dict.admin.coworkers.noCoworkers}
        </p>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand/50 text-warm-gray">
                  <th className="px-5 py-3 font-medium">{dict.admin.coworkers.name}</th>
                  <th className="px-5 py-3 font-medium">{dict.admin.coworkers.plan}</th>
                  <th className="px-5 py-3 font-medium">{dict.admin.coworkers.status}</th>
                  <th className="px-5 py-3 font-medium">{dict.admin.coworkers.used}</th>
                  <th className="px-5 py-3 font-medium">{dict.admin.coworkers.available}</th>
                </tr>
              </thead>
              <tbody>
                {coworkers.map((c) => (
                  <tr key={c.contactId} className="border-b border-sand/30 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/coworkers/${c.contactId}`}
                        className="font-medium text-brown-dark hover:underline"
                      >
                        {c.firstName} {c.lastName ?? ""}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink">{c.planLabel ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[c.membershipStatus]}`}
                      >
                        {statusLabel[c.membershipStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink">{formatMinutesAsHours(c.usedMinutes)}</td>
                    <td className="px-5 py-3 text-ink">
                      {formatMinutesAsHours(c.totalMinutes - c.usedMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
