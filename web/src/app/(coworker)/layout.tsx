import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function CoworkerLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentCoworker();
  const dict = getDictionary(await getLocale());

  if (current?.role === "admin") {
    redirect("/admin");
  }

  if (!current) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-ink">{dict.unlinked.title}</p>
        <p className="text-sm text-warm-gray">{dict.unlinked.body}</p>
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
