import { notFound } from "next/navigation";
import { EventEditForm } from "@/components/admin/EventEditForm";
import { getAdminEventById } from "@/lib/data/events";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const event = await getAdminEventById(supabase, id);

  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{dict.admin.newEventForm.editTitle}</h1>
        <p className="text-sm text-warm-gray">{event.title}</p>
      </div>

      <div className="max-w-md">
        <EventEditForm event={event} />
      </div>
    </div>
  );
}
