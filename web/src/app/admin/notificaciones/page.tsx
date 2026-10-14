import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PushToggle } from "@/components/notifications/PushToggle";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

// Admins never see the coworker profile, so they turn push on here: it's
// how new incidents reach them on their phone.
export default async function AdminNotificationSettingsPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.notificationSettings;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link href="/admin/mas" className="flex items-center gap-1 text-sm font-medium text-brown-dark md:hidden">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {t.backAdmin}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
        <p className="text-sm text-warm-gray">{t.adminSubtitle}</p>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-ink">{t.pushSectionTitle}</h2>
        <PushToggle />
      </section>
    </div>
  );
}
