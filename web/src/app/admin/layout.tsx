import { redirect } from "next/navigation";
import { AccountNotice } from "@/components/layout/AccountNotice";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentAccount } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { current, archived } = await getCurrentAccount();
  const dict = getDictionary(await getLocale());

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

  return (
    <AppShell role="admin" user={current.coworker} dict={dict}>
      {children}
    </AppShell>
  );
}
