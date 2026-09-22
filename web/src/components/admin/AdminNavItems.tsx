"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Package, PlusCircle, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function useAdminNavItems() {
  const { dict } = useI18n();

  return [
    { href: "/admin", label: dict.admin.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/calendario", label: dict.admin.nav.calendar, icon: CalendarDays },
    { href: "/admin/coworkers", label: dict.admin.nav.coworkers, icon: Users },
    { href: "/admin/paquetes", label: dict.admin.nav.packages, icon: Package },
    { href: "/admin/reservar", label: dict.admin.nav.book, icon: PlusCircle },
  ];
}

export function AdminNavLinks({ className }: { className?: (active: boolean) => string }) {
  const pathname = usePathname();
  const items = useAdminNavItems();

  return (
    <>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={
              className
                ? className(isActive)
                : `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-cream font-medium text-brown-dark"
                      : "text-warm-gray hover:bg-cream/60"
                  }`
            }
          >
            <Icon className="h-4 w-4" strokeWidth={isActive ? 2.25 : 1.75} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
