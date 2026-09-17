"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, ListChecks, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function BottomNav() {
  const pathname = usePathname();
  const { dict } = useI18n();

  const NAV_ITEMS = [
    { href: "/", label: dict.nav.home, icon: Home },
    { href: "/reservar", label: dict.nav.book, icon: CalendarDays },
    { href: "/reservas", label: dict.nav.bookings, icon: ListChecks },
    { href: "/perfil", label: dict.nav.profile, icon: User },
  ];

  return (
    <nav className="sticky bottom-0 border-t border-sand/60 bg-cream/95 px-2 pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-2 backdrop-blur-sm">
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-xs transition-colors ${
                  isActive ? "text-brown-dark" : "text-warm-gray"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span className={isActive ? "font-semibold" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
