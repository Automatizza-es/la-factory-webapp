import { redirect } from "next/navigation";
import { AccountNotice } from "@/components/layout/AccountNotice";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentAccount } from "@/lib/data/coworker";
import { getMyNotifications } from "@/lib/data/notifications";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function CoworkerLayout({ children }: { children: React.ReactNode }) {
  const { current, archived } = await getCurrentAccount();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // Admins are never coworkers too: their home is the admin dashboard.
  if (current?.access === "admin") {
    redirect("/admin");
  }

  if (!current) {
    return (
      <AccountNotice
        title={archived ? dict.unlinked.archivedTitle : dict.unlinked.title}
        body={archived ? dict.unlinked.archivedBody : dict.unlinked.body}
        signOutLabel={dict.perfil.signOut}
      />
    );
  }

  const supabase = await createClient();
  const notifications = await getMyNotifications(supabase, current.contactId, dict.notifications, locale);

  return (
    <AppShell role={current.access} user={current.coworker} notifications={notifications} dict={dict}>
      {children}
    </AppShell>
  );
}
