import { AdminBookingForm } from "@/components/admin/AdminBookingForm";
import { getAllContacts, getAllCoworkers, getAllRooms } from "@/lib/data/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReservarPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const [rooms, coworkers, contacts] = await Promise.all([
    getAllRooms(supabase),
    getAllCoworkers(supabase, locale),
    getAllContacts(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.createBooking.title}</h1>
        <p className="text-sm text-warm-gray">{dict.admin.createBooking.subtitle}</p>
      </div>

      <AdminBookingForm rooms={rooms} coworkers={coworkers} contacts={contacts} />
    </div>
  );
}
