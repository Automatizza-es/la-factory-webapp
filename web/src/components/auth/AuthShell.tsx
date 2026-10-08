import Image from "next/image";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// Shared frame for the signed-out screens (login, password recovery, new
// password): logo, title and subtitle above the form.
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-8 px-6">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <Image
        src="/brand/logo-cuadrado-original.jpg"
        alt="La Factory Coworking"
        width={64}
        height={64}
        className="h-16 w-16 rounded-2xl object-cover"
        priority
      />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-warm-gray">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark";

export const authButtonClass =
  "w-full rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60";
