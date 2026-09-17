"use client";

import { usePathname } from "next/navigation";
import { AdminNavLinks } from "@/components/admin/AdminNavItems";

export function AdminMobileNav() {
  usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-sand/60 bg-white px-2 pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-2 md:hidden">
      <div className="grid grid-cols-4">
        <AdminNavLinks
          className={(active) =>
            `flex flex-col items-center gap-1 rounded-xl py-1.5 text-xs transition-colors ${
              active ? "font-semibold text-brown-dark" : "text-warm-gray"
            }`
          }
        />
      </div>
    </nav>
  );
}
