import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { getCurrentCoworker } from "@/lib/data/coworker";

export default async function CoworkerLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentCoworker();

  if (!current) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-ink">Tu cuenta todavía no está vinculada</p>
        <p className="text-sm text-warm-gray">
          Hemos verificado tu email pero no encontramos ningún coworker asociado. Contacta con
          La Factory para activarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-[2.5rem] md:border md:border-sand/50 md:shadow-xl">
      <AppHeader coworker={current.coworker} />
      <main className="flex-1 px-5 py-5">{children}</main>
      <BottomNav />
    </div>
  );
}
