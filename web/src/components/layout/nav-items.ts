"use client";

import {
  Building2,
  CalendarDays,
  Home,
  LayoutDashboard,
  ListChecks,
  Menu,
  Package,
  PartyPopper,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// "guest": signed-in person with no plan right now (Invitado).
export type AppRole = "admin" | "coworker" | "guest";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Other paths that should also light this item up (e.g. "Más" for the
  // pages listed inside it).
  alsoActiveOn?: string[];
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const roots = ["/", "/admin"];
  const matches = (href: string) =>
    roots.includes(href) ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return matches(item.href) || (item.alsoActiveOn ?? []).some(matches);
}

// One app, two roles: the bottom bar (phone) stays short, the sidebar
// (tablet/desktop) has room to list every section directly.
export function useNavItems(role: AppRole): { bottom: NavItem[]; sidebar: NavItem[] } {
  const { dict } = useI18n();

  if (role === "admin") {
    const nav = dict.admin.nav;
    const dashboard = { href: "/admin", label: nav.dashboard, icon: LayoutDashboard };
    const bookings = { href: "/admin/calendario", label: nav.bookings, icon: CalendarDays };
    const users = { href: "/admin/coworkers", label: nav.users, icon: Users };
    return {
      bottom: [
        dashboard,
        bookings,
        users,
        {
          href: "/admin/mas",
          label: nav.more,
          icon: Menu,
          alsoActiveOn: ["/admin/eventos", "/admin/paquetes", "/admin/empresas"],
        },
      ],
      sidebar: [
        dashboard,
        bookings,
        users,
        { href: "/admin/empresas", label: nav.companies, icon: Building2 },
        { href: "/admin/eventos", label: nav.events, icon: PartyPopper },
        { href: "/admin/paquetes", label: nav.packages, icon: Package },
      ],
    };
  }

  const nav = dict.nav;
  const home = { href: "/", label: nav.home, icon: Home };
  const events = { href: "/eventos", label: nav.events, icon: PartyPopper };
  const packages = { href: "/paquetes", label: nav.packages, icon: Package };
  const profile = { href: "/perfil", label: nav.profile, icon: User };

  // No plan, no bookings: community side only.
  if (role === "guest") {
    const items = [home, events, packages, profile];
    return { bottom: items, sidebar: items };
  }

  const book = { href: "/calendario", label: nav.book, icon: CalendarDays, alsoActiveOn: ["/reservar"] };
  const bookings = { href: "/reservas", label: nav.bookings, icon: ListChecks };
  return {
    bottom: [home, book, bookings, profile],
    sidebar: [home, book, bookings, events, packages, profile],
  };
}
