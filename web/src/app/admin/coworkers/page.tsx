import Link from "next/link";
import { Building2, CheckCircle2, Plus, Search } from "lucide-react";
import { InvitationActions } from "@/components/admin/InvitationActions";
import { WelcomeButton } from "@/components/admin/WelcomeButton";
import { getAllCoworkers, type AdminCoworkerStage, type PersonKind } from "@/lib/data/admin";
import { formatMinutesAsHours } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

const STAGE_STYLE: Record<AdminCoworkerStage, string> = {
  active: "",
  no_access: "bg-amber-50 text-amber-700",
  invited: "bg-cream text-warm-gray",
  onboarding: "bg-amber-50 text-amber-700",
  invite_expired: "bg-red-50 text-red-600",
  invite_cancelled: "bg-red-50 text-red-600",
};

const KIND_STYLE: Record<PersonKind, string> = {
  admin: "bg-brown-dark text-white",
  coworker: "bg-sand/50 text-brown-dark",
  guest: "bg-cream text-warm-gray",
  archived: "bg-warm-gray/15 text-warm-gray",
};

type Filter = "todos" | "coworkers" | "invitados" | "admins" | "archivados";
const FILTER_KIND: Record<Exclude<Filter, "todos">, PersonKind> = {
  coworkers: "coworker",
  invitados: "guest",
  admins: "admin",
  archivados: "archived",
};

interface PageProps {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { filtro, q } = await searchParams;
  const filter: Filter = filtro && filtro in FILTER_KIND ? (filtro as Filter) : "todos";
  const query = (q ?? "").trim().toLowerCase();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.admin.coworkers;
  const supabase = await createClient();
  const everyone = await getAllCoworkers(supabase, locale);

  // "Todos" means everyone still part of the community: archived people
  // only show under their own filter.
  const people = everyone.filter((p) => {
    if (filter === "todos" ? p.kind === "archived" : p.kind !== FILTER_KIND[filter]) return false;
    if (!query) return true;
    const haystack = `${p.firstName} ${p.lastName ?? ""} ${p.email ?? ""}`.toLowerCase();
    return haystack.includes(query);
  });

  const stageLabel: Record<AdminCoworkerStage, string> = {
    active: "",
    no_access: t.statusNoAccess,
    invited: t.statusInvited,
    onboarding: t.statusOnboarding,
    invite_expired: t.statusInviteExpired,
    invite_cancelled: t.statusInviteCancelled,
  };
  const kindLabel: Record<PersonKind, string> = {
    admin: t.kindAdmin,
    coworker: t.kindCoworker,
    guest: t.kindGuest,
    archived: t.kindArchived,
  };
  const filters: { key: Filter; label: string }[] = [
    { key: "todos", label: t.filterAll },
    { key: "coworkers", label: t.filterCoworkers },
    { key: "invitados", label: t.filterGuests },
    { key: "admins", label: t.filterAdmins },
    { key: "archivados", label: t.filterArchived },
  ];
  const filterHref = (key: Filter) => {
    const params = new URLSearchParams();
    if (key !== "todos") params.set("filtro", key);
    if (query) params.set("q", q ?? "");
    const qs = params.toString();
    return `/admin/coworkers${qs ? `?${qs}` : ""}`;
  };

  const withoutAccess = everyone
    .filter((c) => c.stage === "no_access" && c.kind !== "archived")
    .map((c) => c.contactId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
          <p className="text-sm text-warm-gray">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {withoutAccess.length > 0 && (
            <WelcomeButton bulk contactIds={withoutAccess} label={t.sendWelcomeAll(withoutAccess.length)} />
          )}
          <Link
            href="/admin/empresas"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brown-dark shadow-sm"
          >
            <Building2 className="h-4 w-4" strokeWidth={2} />
            {dict.admin.nav.companies}
          </Link>
          <Link
            href="/admin/coworkers/new"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t.newCoworker}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                filter === f.key ? "bg-brown-dark text-white" : "bg-white text-warm-gray shadow-sm"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form action="/admin/coworkers" className="flex items-center gap-2 md:w-72">
          {filter !== "todos" && <input type="hidden" name="filtro" value={filter} />}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" strokeWidth={2} />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder={t.searchPlaceholder}
              aria-label={t.search}
              className="w-full rounded-xl border border-sand bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-brown-dark"
            />
          </div>
        </form>
      </div>

      {people.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
          {everyone.length === 0 ? t.noCoworkers : t.noResults}
        </p>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand/50 text-warm-gray">
                  <th className="px-5 py-3 font-medium">{t.name}</th>
                  <th className="px-5 py-3 font-medium">{t.status}</th>
                  <th className="px-5 py-3 font-medium">{t.plan}</th>
                  <th className="px-5 py-3 font-medium">{t.used}</th>
                  <th className="px-5 py-3 font-medium">{t.available}</th>
                  <th className="px-5 py-3 font-medium">{t.access}</th>
                </tr>
              </thead>
              <tbody>
                {people.map((c) => {
                  // Expired invitations keep their actions so "Reenviar" can revive them.
                  const isPending =
                    c.stage === "invited" || c.stage === "onboarding" || c.stage === "invite_expired";
                  const name = `${c.firstName} ${c.lastName ?? ""}`.trim() || c.email || "—";
                  const hasHours = c.kind === "coworker";

                  return (
                    <tr key={c.contactId} className="border-b border-sand/30 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/coworkers/${c.contactId}`}
                          className="font-medium text-brown-dark hover:underline"
                        >
                          {name}
                        </Link>
                        {c.email && name !== c.email && (
                          <p className="text-xs text-warm-gray">{c.email}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${KIND_STYLE[c.kind]}`}>
                          {kindLabel[c.kind]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink">
                        {c.planLabel ?? (c.sharedWithName ? t.sharedWith(c.sharedWithName) : "—")}
                      </td>
                      <td className="px-5 py-3 text-ink">
                        {hasHours ? formatMinutesAsHours(c.usedMinutes) : "—"}
                      </td>
                      <td className="px-5 py-3 text-ink">
                        {hasHours ? formatMinutesAsHours(c.totalMinutes - c.usedMinutes) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {c.stage === "active" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                          ) : (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_STYLE[c.stage]}`}>
                              {c.stage === "invited" && c.invitation?.kind === "welcome"
                                ? t.statusWelcomeSent
                                : stageLabel[c.stage]}
                            </span>
                          )}
                          {c.stage === "no_access" && c.kind !== "archived" && (
                            <WelcomeButton contactIds={[c.contactId]} label={t.sendWelcome} />
                          )}
                          {isPending && c.invitation && (
                            <InvitationActions invitationId={c.invitation.id} token={c.invitation.token} />
                          )}
                        </div>
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
