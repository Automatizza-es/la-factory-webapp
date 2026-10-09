"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound } from "lucide-react";
import { isNavItemActive, useNavItems, type AppRole } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { useI18n } from "@/lib/i18n/context";
import type { Coworker } from "@/types/domain";

// Tablet/desktop navigation, shared by every role (each sees its own
// sections). Hidden on phones, where BottomNav takes over.
export function Sidebar({ role, user }: { role: AppRole; user: Coworker }) {
  const pathname = usePathname();
  const { dict } = useI18n();
  const { sidebar } = useNavItems(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-sand/50 bg-white px-4 py-6 md:flex">
      <Link href={role === "admin" ? "/admin" : "/"} className="flex items-center gap-2.5 px-2">
        <Image
          src="/brand/logo-cuadrado-original.jpg"
          alt="La Factory Coworking"
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-cover"
        />
        <span className="text-sm font-semibold text-ink">La Factory</span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {sidebar.map((item) => {
          const { href, label, icon: Icon } = item;
          const isActive = isNavItemActive(item, pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive ? "bg-cream font-medium text-brown-dark" : "text-warm-gray hover:bg-cream/60"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-sand/50 pt-4">
        <div className="flex min-w-0 items-center gap-2 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-semibold text-brown-dark">
            {user.initials}
          </div>
          <span className="truncate text-sm font-medium text-ink">{user.firstName}</span>
        </div>
        <Link
          href="/nueva-contrasena"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-warm-gray hover:bg-cream/60"
        >
          <KeyRound className="h-4 w-4" strokeWidth={1.75} />
          {dict.perfil.changePassword}
        </Link>
        <SignOutButton label={dict.perfil.signOut} />
      </div>
    </aside>
  );
}
