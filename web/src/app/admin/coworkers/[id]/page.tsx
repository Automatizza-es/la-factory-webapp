import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminBookingRow } from "@/components/admin/AdminBookingRow";
import { QuotaCard } from "@/components/home/QuotaCard";
import { getCoworkerDetail } from "@/lib/data/admin";
import { formatMinutesAsHours } from "@/lib/format";
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

  const membershipStatusLabel: Record<string, string> = {
    active: dict.admin.coworkers.statusActive,
    ended: dict.admin.coworkers.statusEnded,
    cancelled: dict.admin.coworkers.statusCancelled,
  };

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

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-ink">{dict.admin.coworkerDetail.personalData}</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <p className="text-ink">
              <span className="font-medium">
                {detail.contact.firstName} {detail.contact.lastName ?? ""}
              </span>
            </p>
            <p className="text-warm-gray">
              {dict.admin.coworkerDetail.email}: {detail.contact.email ?? "—"}
            </p>
            <p className="text-warm-gray">
              {dict.admin.coworkerDetail.phone}: {detail.contact.phone ?? "—"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-ink">{dict.admin.coworkerDetail.plan}</h2>
          {detail.membership ? (
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <p className="text-ink">{detail.membership.planLabel}</p>
              <p className="text-warm-gray">
                {dict.admin.coworkerDetail.status}:{" "}
                {membershipStatusLabel[detail.membership.status] ?? detail.membership.status}
              </p>
              <p className="text-warm-gray">
                {dict.admin.coworkerDetail.startDate}: {detail.membership.startDate}
              </p>
              <p className="text-warm-gray">
                {dict.admin.coworkerDetail.endDate}:{" "}
                {detail.membership.endDate ?? dict.admin.coworkerDetail.ongoing}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-warm-gray">{dict.admin.coworkers.statusNone}</p>
          )}
        </section>
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
