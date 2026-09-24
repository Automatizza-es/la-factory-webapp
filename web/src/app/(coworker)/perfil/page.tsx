import { Bell, CalendarRange, ChevronRight, Mail, Package, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { getCurrentCoworker, getQuotaSummary } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const [quota, auth] = await Promise.all([
    getQuotaSummary(supabase, current.contactId, locale),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand text-2xl font-semibold text-brown-dark">
          {current.coworker.initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{current.coworker.firstName}</h1>
          <p className="text-sm text-warm-gray">{auth.data.user?.email}</p>
        </div>
      </div>

      <section className="flex flex-col divide-y divide-sand/40 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
          <div>
            <p className="text-sm text-warm-gray">{dict.perfil.plan}</p>
            <p className="font-medium text-ink">{quota?.planLabel ?? dict.perfil.noActivePlan}</p>
          </div>
        </div>
        {quota && (
          <div className="flex items-center gap-3 p-4">
            <CalendarRange className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
            <div>
              <p className="text-sm text-warm-gray">{dict.perfil.currentPeriod}</p>
              <p className="font-medium text-ink">{quota.periodLabel}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 p-4">
          <Mail className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
          <div>
            <p className="text-sm text-warm-gray">{dict.perfil.contact}</p>
            <p className="font-medium text-ink">hola@lafactorycoworking.com</p>
          </div>
        </div>
      </section>

      <Link
        href="/paquetes"
        className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        <Package className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
        <span className="flex-1 font-medium text-ink">{dict.packages.title}</span>
        <ChevronRight className="h-4 w-4 text-warm-gray" strokeWidth={2} />
      </Link>

      <Link
        href="/perfil/notificaciones"
        className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        <Bell className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
        <span className="flex-1 font-medium text-ink">{dict.perfil.notifications}</span>
        <ChevronRight className="h-4 w-4 text-warm-gray" strokeWidth={2} />
      </Link>

      <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
        {dict.perfil.comingSoon}
      </p>

      <SignOutButton label={dict.perfil.signOut} />
    </div>
  );
}
