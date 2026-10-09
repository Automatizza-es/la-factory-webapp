import { redirect } from "next/navigation";
import Image from "next/image";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserRound } from "lucide-react";
import { getCurrentCoworker, hasActiveMembership } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentCoworker();
  const dict = getDictionary(await getLocale());

  if (!current) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-ink">{dict.unlinked.title}</p>
        <p className="text-sm text-warm-gray">{dict.unlinked.body}</p>
      </div>
    );
  }

  if (current.role !== "admin") {
    redirect("/");
  }

  const isAlsoCoworker = await hasActiveMembership(await createClient(), current.contactId);

  return (
    <div className="min-h-screen">
      <AdminSidebar
        admin={current.coworker}
        signOutLabel={dict.perfil.signOut}
        changePasswordLabel={dict.perfil.changePassword}
        coworkerSpaceLabel={isAlsoCoworker ? dict.perfil.coworkerSpace : undefined}
      />

      <div className="flex min-h-screen flex-col md:pl-60">
        <header className="flex items-center justify-between border-b border-sand/50 bg-white px-5 py-4 md:hidden">
          <Image
            src="/brand/logo-cuadrado-original.jpg"
            alt="La Factory Coworking"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div className="flex items-center gap-2">
            {isAlsoCoworker && (
              // Plain <a>: /modo/coworker sets a cookie, so it must not be prefetched.
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a
                href="/modo/coworker"
                aria-label={dict.perfil.coworkerSpace}
                className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-2 text-xs font-medium text-brown-dark"
              >
                <UserRound className="h-4 w-4" strokeWidth={2} />
                {dict.perfil.coworkerSpace}
              </a>
            )}
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 bg-cream px-5 py-6 md:px-8 md:py-8">{children}</main>

        <AdminMobileNav />
      </div>
    </div>
  );
}
