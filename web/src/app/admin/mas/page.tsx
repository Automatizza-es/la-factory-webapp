import Link from "next/link";
import { CalendarPlus, ChevronRight, KeyRound, Package, PartyPopper } from "lucide-react";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

// "Más" tab of the admin's phone navigation: the sections that don't fit in
// the bottom bar, plus account actions. On desktop they're all in the
// sidebar already.
export default async function AdminMorePage() {
  const dict = getDictionary(await getLocale());
  const nav = dict.admin.nav;

  const sections = [
    { href: "/admin/reservar", label: nav.book, icon: CalendarPlus },
    { href: "/admin/eventos", label: nav.events, icon: PartyPopper },
    { href: "/admin/paquetes", label: nav.packages, icon: Package },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{nav.more}</h1>

      <section className="flex flex-col divide-y divide-sand/40 rounded-2xl bg-white shadow-sm">
        {sections.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 p-4">
            <Icon className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
            <span className="flex-1 font-medium text-ink">{label}</span>
            <ChevronRight className="h-4 w-4 text-warm-gray" strokeWidth={2} />
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{nav.account}</h2>
        <Link
          href="/nueva-contrasena"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          <KeyRound className="h-5 w-5 text-brown-dark" strokeWidth={1.75} />
          <span className="flex-1 font-medium text-ink">{dict.perfil.changePassword}</span>
          <ChevronRight className="h-4 w-4 text-warm-gray" strokeWidth={2} />
        </Link>
        <SignOutButton label={dict.perfil.signOut} />
      </section>
    </div>
  );
}
