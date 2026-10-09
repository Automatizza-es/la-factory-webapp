"use client";

import {
  Building2,
  CalendarDays,
  Wrench,
  Receipt,
  Settings,
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
          alsoActiveOn: [
            "/admin/eventos",
            "/admin/paquetes",
            "/admin/incidencias",
            "/admin/empresas",
            "/admin/facturacion",
            "/admin/configuracion",
          ],
        },
      ],
      sidebar: [
        dashboard,
        bookings,
        users,
        { href: "/admin/incidencias", label: nav.incidents, icon: Wrench },
        { href: "/admin/empresas", label: nav.companies, icon: Building2 },
        { href: "/admin/eventos", label: nav.events, icon: PartyPopper },
        { href: "/admin/paquetes", label: nav.packages, icon: Package },
        { href: "/admin/facturacion", label: nav.billing, icon: Receipt },
        { href: "/admin/configuracion", label: nav.settings, icon: Settings },
      ],
    };
  }

  const nav = dict.nav;
  const home = { href: "/", label: nav.home, icon: Home };
  const events = { href: "/eventos", label: nav.events, icon: PartyPopper };
  const packages = { href: "/paquetes", label: nav.packages, icon: Package };
  const profile = { href: "/perfil", label: nav.profile, icon: User };
  const incidents = { href: "/incidencias", label: nav.incidents, icon: Wrench };

  // No plan, no bookings: community side only.
  if (role === "guest") {
    return {
      bottom: [home, events, packages, profile],
      sidebar: [home, events, packages, incidents, profile],
    };
  }

  const book = { href: "/calendario", label: nav.book, icon: CalendarDays, alsoActiveOn: ["/reservar"] };
  const bookings = { href: "/reservas", label: nav.bookings, icon: ListChecks };
  return {
    bottom: [home, book, bookings, profile],
    sidebar: [home, book, bookings, events, packages, incidents, profile],
  };
}
