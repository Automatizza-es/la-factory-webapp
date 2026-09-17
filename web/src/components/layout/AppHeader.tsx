import Image from "next/image";
import { Bell } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { Coworker } from "@/types/domain";

interface AppHeaderProps {
  coworker: Coworker;
}

export function AppHeader({ coworker }: AppHeaderProps) {
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
        <button
          type="button"
          aria-label="Notificaciones"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand/40"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
        </button>
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
