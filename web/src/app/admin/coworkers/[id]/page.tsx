import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminBookingRow } from "@/components/admin/AdminBookingRow";
import { PersonBillingCard } from "@/components/admin/person/PersonBillingCard";
import { PersonFieldsCard } from "@/components/admin/person/PersonFieldsCard";
import { PersonFlagsCard } from "@/components/admin/person/PersonFlagsCard";
import { PersonPlanCard } from "@/components/admin/person/PersonPlanCard";
import { QuotaCard } from "@/components/home/QuotaCard";
import { getCoworkerDetail } from "@/lib/data/admin";
import { formatMinutesAsHours } from "@/lib/format";
import { LOCALE_LABELS, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCoworkerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const detail = await getCoworkerDetail(supabase, id, locale);

  if (!detail) notFound();
  const c = detail.contact;
  const u = dict.admin.userDetail;
  const kindLabel =
    c.status === "archived"
      ? dict.admin.coworkers.kindArchived
      : detail.role === "admin"
        ? dict.admin.coworkers.kindAdmin
        : detail.quota
          ? dict.admin.coworkers.kindCoworker
          : dict.admin.coworkers.kindGuest;


  const reasonLabel: Record<string, string> = {
    monthly_grant: dict.admin.coworkerDetail.reasonMonthlyGrant,
    booking: dict.admin.coworkerDetail.reasonBooking,
    booking_cancellation: dict.admin.coworkerDetail.reasonCancellation,
    manual_adjustment: dict.admin.coworkerDetail.reasonManualAdjustment,
  };

  const upcoming = detail.bookings.filter((b) => b.status === "upcoming");
  const history = detail.bookings.filter((b) => b.status !== "upcoming");

  const bookingStatusLabel: Record<string, string> = {
    upcoming: dict.booking.statusUpcoming,
    completed: dict.booking.statusCompleted,
    cancelled: dict.booking.statusCancelled,
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/coworkers"
        className="flex items-center gap-1 text-sm font-medium text-brown-dark"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {dict.admin.coworkerDetail.back}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">
          {`${c.firstName} ${c.lastName ?? ""}`.trim() || c.email}
        </h1>
        <span className="rounded-full bg-sand/50 px-2.5 py-1 text-xs font-medium text-brown-dark">
          {kindLabel}
        </span>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <PersonFieldsCard
          contactId={c.id}
          title={u.sectionPersonal}
          fields={[
            { key: "first_name", label: u.firstName },
            { key: "last_name", label: u.lastName },
            { key: "nif", label: u.nif },
            { key: "phone", label: u.phone, kind: "tel" },
            { key: "company_name", label: u.company },
            {
              key: "preferred_locale",
              label: u.language,
              kind: "select",
              options: locales.map((code) => ({ value: code, label: LOCALE_LABELS[code].name })),
            },
          ]}
          initial={{
            first_name: c.firstName,
            last_name: c.lastName ?? "",
            nif: c.nif ?? "",
            phone: c.phone ?? "",
            company_name: c.companyName ?? "",
            preferred_locale: c.preferredLocale,
          }}
        >
          <div className="text-sm">
            <p className="text-xs font-medium text-warm-gray">{u.email}</p>
            <p className="text-ink">{c.email ?? "—"}</p>
            <p className="mt-0.5 text-xs text-warm-gray">{u.emailHint}</p>
          </div>
        </PersonFieldsCard>

        <div className="flex flex-col gap-4">
          <PersonFlagsCard
            contactId={c.id}
            archived={c.status === "archived"}
            canReceivePackages={c.canReceivePackages}
            newsletter={c.newsletter}
          />
          {detail.role !== "admin" && (
            <PersonPlanCard
              contactId={c.id}
              membership={detail.membership}
              sharedWith={detail.sharedWith}
              plans={detail.plans}
              shareCandidates={detail.shareCandidates}
            />
          )}
        </div>

        <PersonBillingCard
          contactId={c.id}
          billingCompanyId={c.billingCompanyId}
          address={{
            address: c.address,
            city: c.city,
            postalCode: c.postalCode,
            province: c.province,
            country: c.country,
          }}
          companies={detail.companies}
        />

        <PersonFieldsCard
          contactId={c.id}
          title={u.sectionAdmin}
          fields={[
            { key: "holded_contact_id", label: u.holdedId, wide: true },
            { key: "internal_notes", label: u.internalNotes, kind: "textarea" },
          ]}
          initial={{
            holded_contact_id: c.holdedContactId ?? "",
            internal_notes: c.internalNotes ?? "",
          }}
        />
      </div>

      {detail.quota && (
        <section>
          <h2 className="mb-3 font-semibold text-ink">{dict.admin.coworkerDetail.quotaThisMonth}</h2>
          <QuotaCard quota={detail.quota} dict={dict.quota} />
        </section>
      )}

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-ink">{dict.admin.coworkerDetail.movements}</h2>
        {detail.movements.length === 0 ? (
          <p className="mt-3 text-sm text-warm-gray">{dict.admin.coworkerDetail.noMovements}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {detail.movements.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span className="text-ink">
                  {reasonLabel[m.reasonCode] ?? m.reasonCode}
                  {m.note ? ` · ${m.note}` : ""}
                </span>
                <span
                  className={`font-medium ${m.deltaMinutes < 0 ? "text-red-600" : "text-brown-dark"}`}
                >
                  {m.deltaMinutes > 0 ? "+" : ""}
                  {formatMinutesAsHours(Math.abs(m.deltaMinutes))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink">{dict.admin.coworkerDetail.upcomingBookings}</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
            {dict.admin.coworkerDetail.noUpcoming}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <AdminBookingRow
                key={b.id}
                booking={b}
                locale={locale}
                statusLabel={bookingStatusLabel[b.status]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink">{dict.admin.coworkerDetail.history}</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
            {dict.admin.coworkerDetail.noHistory}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((b) => (
              <AdminBookingRow
                key={b.id}
                booking={b}
                locale={locale}
                statusLabel={bookingStatusLabel[b.status]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
