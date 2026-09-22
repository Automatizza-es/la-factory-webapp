import Image from "next/image";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NotificationBell } from "@/components/layout/NotificationBell";
import type { NotificationItem } from "@/lib/data/notifications";
import type { Coworker } from "@/types/domain";

interface AppHeaderProps {
  coworker: Coworker;
  notifications: NotificationItem[];
  notificationsTitle: string;
  notificationsEmpty: string;
}

export function AppHeader({
  coworker,
  notifications,
  notificationsTitle,
  notificationsEmpty,
}: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-6">
      <Image
        src="/brand/logo-cuadrado-original.jpg"
        alt="La Factory Coworking"
        width={48}
        height={48}
        className="h-12 w-12 rounded-xl object-cover"
        priority
      />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <NotificationBell
          notifications={notifications}
          title={notificationsTitle}
          emptyLabel={notificationsEmpty}
        />
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-sm font-semibold text-brown-dark"
          aria-label={`Perfil de ${coworker.firstName}`}
        >
          {coworker.initials}
        </div>
      </div>
    </header>
  );
}
