import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PreferencesForm } from "@/components/notifications/PreferencesForm";
import { PushToggle } from "@/components/notifications/PushToggle";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationSettingsPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const dict = getDictionary(await getLocale());
  const t = dict.notificationSettings;
  const supabase = await createClient();

  const { data: prefs } = await supabase.rpc("get_notification_preferences").single();
  const preferences = (prefs as {
    booking_reminders: boolean;
    packages: boolean;
    events: boolean;
  } | null) ?? { booking_reminders: true, packages: true, events: true };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/perfil" className="flex items-center gap-1 text-sm font-medium text-brown-dark">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        {t.back}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
        <p className="text-sm text-warm-gray">{t.subtitle}</p>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-ink">{t.pushSectionTitle}</h2>
        <PushToggle />
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-ink">{t.preferencesTitle}</h2>
        <PreferencesForm
          initial={{
            bookingReminders: preferences.booking_reminders,
            packages: preferences.packages,
            events: preferences.events,
          }}
        />
      </section>
    </div>
  );
}
