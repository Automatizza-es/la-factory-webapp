import Image from "next/image";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AdminNavLinks } from "@/components/admin/AdminNavItems";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SignOutButton } from "@/components/layout/SignOutButton";
import type { Coworker } from "@/types/domain";

interface AdminSidebarProps {
  admin: Coworker;
  signOutLabel: string;
  changePasswordLabel: string;
}

export function AdminSidebar({ admin, signOutLabel, changePasswordLabel }: AdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-sand/50 bg-white px-4 py-6 md:flex">
      <div className="flex items-center gap-2.5 px-2">
        <Image
          src="/brand/logo-cuadrado-original.jpg"
          alt="La Factory Coworking"
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-cover"
        />
        <span className="text-sm font-semibold text-ink">La Factory</span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <AdminNavLinks />
      </nav>

      <div className="flex flex-col gap-3 border-t border-sand/50 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-xs font-semibold text-brown-dark">
              {admin.initials}
            </div>
            <span className="text-sm font-medium text-ink">{admin.firstName}</span>
          </div>
          <LanguageSwitcher />
        </div>
        <Link
          href="/nueva-contrasena"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-warm-gray hover:bg-cream/60"
        >
          <KeyRound className="h-4 w-4" strokeWidth={1.75} />
          {changePasswordLabel}
        </Link>
        <SignOutButton label={signOutLabel} />
      </div>
    </aside>
  );
}
