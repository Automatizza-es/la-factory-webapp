import Image from "next/image";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NotificationBell } from "@/components/layout/NotificationBell";
import type { NotificationItem } from "@/lib/data/notifications";
import type { Coworker } from "@/types/domain";

interface AppHeaderProps {
  coworker: Coworker;
  // Omitted for roles that don't get notifications yet (admin): no bell.
  notifications?: NotificationItem[];
  notificationsTitle: string;
  notificationsEmpty: string;
}

// On tablet/desktop the Sidebar already shows the logo and the language
// switcher, so the header keeps only the bell and the avatar there.
export function AppHeader({
  coworker,
  notifications,
  notificationsTitle,
  notificationsEmpty,
}: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 md:justify-end md:px-8">
      <Image
        src="/brand/logo-cuadrado-original.jpg"
        alt="La Factory Coworking"
        width={48}
        height={48}
        className="h-12 w-12 rounded-xl object-cover md:hidden"
        priority
      />
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>
        {notifications && (
          <NotificationBell
            notifications={notifications}
            title={notificationsTitle}
            emptyLabel={notificationsEmpty}
          />
        )}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-sm font-semibold text-brown-dark"
          aria-label={coworker.firstName}
        >
          {coworker.initials}
        </div>
      </div>
    </header>
  );
}
