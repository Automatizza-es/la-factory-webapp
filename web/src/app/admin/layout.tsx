import { redirect } from "next/navigation";
import Image from "next/image";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

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

  return (
    <div className="min-h-screen">
      <AdminSidebar admin={current.coworker} signOutLabel={dict.perfil.signOut} />

      <div className="flex min-h-screen flex-col md:pl-60">
        <header className="flex items-center justify-between border-b border-sand/50 bg-white px-5 py-4 md:hidden">
          <Image
            src="/brand/logo-cuadrado-original.jpg"
            alt="La Factory Coworking"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-cover"
          />
          <LanguageSwitcher />
        </header>

        <main className="flex-1 bg-cream px-5 py-6 md:px-8 md:py-8">{children}</main>

        <AdminMobileNav />
      </div>
    </div>
  );
}
