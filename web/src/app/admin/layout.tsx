import { redirect } from "next/navigation";
import { AccountNotice } from "@/components/layout/AccountNotice";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentAccount } from "@/lib/data/coworker";
import { getMyNotifications } from "@/lib/data/notifications";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { current, archived } = await getCurrentAccount();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  if (!current) {
    return (
      <AccountNotice
        title={archived ? dict.unlinked.archivedTitle : dict.unlinked.title}
        body={archived ? dict.unlinked.archivedBody : dict.unlinked.body}
        signOutLabel={dict.perfil.signOut}
      />
    );
  }

  if (current.role !== "admin") {
    redirect("/");
  }

  // Admins get notified of new incidents.
  const notifications = await getMyNotifications(
    await createClient(),
    current.contactId,
    dict.notifications,
    locale,
    dict.incidents,
  );

  return (
    <AppShell role="admin" user={current.coworker} notifications={notifications} dict={dict}>
      {children}
    </AppShell>
  );
}
