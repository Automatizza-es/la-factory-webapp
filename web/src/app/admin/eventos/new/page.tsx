import { EventForm } from "@/components/admin/EventForm";
import { getAllRooms } from "@/lib/data/admin";
import { getActivePlans } from "@/lib/data/events";
import { getActiveContactsForPicker } from "@/lib/data/packages";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const [rooms, plans, contacts] = await Promise.all([
    getAllRooms(supabase),
    getActivePlans(supabase),
    getActiveContactsForPicker(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.newEventForm.title}</h1>
      </div>

      <div className="max-w-md">
        <EventForm rooms={rooms} plans={plans} contacts={contacts} />
      </div>
    </div>
  );
}
