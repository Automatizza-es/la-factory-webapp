import { EventCard } from "@/components/events/EventCard";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getEventList } from "@/lib/data/events";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function EventosPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const { upcoming, past } = await getEventList(supabase, current.contactId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.events.title}</h1>
        <p className="text-sm text-warm-gray">{dict.events.subtitle}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{dict.events.upcoming}</h2>
        <div className="flex flex-col gap-3">
          {upcoming.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.events.noUpcoming}
            </p>
          ) : (
            upcoming.map((event) => <EventCard key={event.id} event={event} dict={dict.events} locale={locale} />)
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{dict.events.past}</h2>
        <div className="flex flex-col gap-3">
          {past.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.events.noPast}
            </p>
          ) : (
            past.map((event) => <EventCard key={event.id} event={event} dict={dict.events} locale={locale} />)
          )}
        </div>
      </section>
    </div>
  );
}
