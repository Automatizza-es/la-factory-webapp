import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getMyNotifications } from "@/lib/data/notifications";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function CoworkerLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentCoworker();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // Admins are never coworkers too: their home is the admin dashboard.
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

  const supabase = await createClient();
  const notifications = await getMyNotifications(supabase, current.contactId, dict.notifications, locale);

  return (
    <AppShell role="coworker" user={current.coworker} notifications={notifications} dict={dict}>
      {children}
    </AppShell>
  );
}
