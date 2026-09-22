import Link from "next/link";
import { Plus } from "lucide-react";
import { InvitationActions } from "@/components/admin/InvitationActions";
import { getAllCoworkers, type AdminCoworkerStage } from "@/lib/data/admin";
import { formatMinutesAsHours } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

const STAGE_STYLE: Record<AdminCoworkerStage, string> = {
  active: "bg-sand/50 text-brown-dark",
  invited: "bg-cream text-warm-gray",
  onboarding: "bg-amber-50 text-amber-700",
  invite_expired: "bg-red-50 text-red-600",
  invite_cancelled: "bg-red-50 text-red-600",
};

export default async function AdminCoworkersPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const coworkers = await getAllCoworkers(supabase, locale);

  const membershipStatusLabel: Record<string, string> = {
    active: dict.admin.coworkers.statusActive,
    ended: dict.admin.coworkers.statusEnded,
    cancelled: dict.admin.coworkers.statusCancelled,
    none: dict.admin.coworkers.statusNone,
  };

  const stageLabel: Record<AdminCoworkerStage, string> = {
    active: dict.admin.coworkers.statusActive,
    invited: dict.admin.coworkers.statusInvited,
    onboarding: dict.admin.coworkers.statusOnboarding,
    invite_expired: dict.admin.coworkers.statusInviteExpired,
    invite_cancelled: dict.admin.coworkers.statusInviteCancelled,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.admin.coworkers.title}</h1>
          <p className="text-sm text-warm-gray">{dict.admin.coworkers.subtitle}</p>
        </div>
        <Link
          href="/admin/coworkers/new"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {dict.admin.coworkers.newCoworker}
        </Link>
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
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {coworkers.map((c) => {
                  const isPending = c.stage === "invited" || c.stage === "onboarding";
                  const name = `${c.firstName} ${c.lastName ?? ""}`.trim() || c.email || "—";

                  return (
                    <tr key={c.contactId} className="border-b border-sand/30 last:border-0">
                      <td className="px-5 py-3">
                        {c.stage === "active" ? (
                          <Link
                            href={`/admin/coworkers/${c.contactId}`}
                            className="font-medium text-brown-dark hover:underline"
                          >
                            {name}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink">{name}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink">{c.planLabel ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_STYLE[c.stage]}`}
                        >
                          {c.stage === "active"
                            ? membershipStatusLabel[c.membershipStatus]
                            : stageLabel[c.stage]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink">
                        {c.stage === "active" ? formatMinutesAsHours(c.usedMinutes) : "—"}
                      </td>
                      <td className="px-5 py-3 text-ink">
                        {c.stage === "active"
                          ? formatMinutesAsHours(c.totalMinutes - c.usedMinutes)
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {isPending && c.invitation && (
                          <InvitationActions
                            invitationId={c.invitation.id}
                            token={c.invitation.token}
                            dict={dict.admin.coworkers}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
