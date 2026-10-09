import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnnouncementsPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.admin.announcements;
  const supabase = await createClient();
  const [{ data: plans }, { data: contacts }] = await Promise.all([
    supabase.from("plans").select("id, name").eq("is_active", true).order("name"),
    supabase.from("contacts").select("id, first_name, last_name, email").eq("status", "active").order("first_name"),
  ]);
  const people = (contacts ?? []).map((c) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name ?? ""}`.trim() || c.email || "—",
  }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t.title}</h1>
        <p className="text-sm text-warm-gray">{t.subtitle}</p>
      </div>
      <AnnouncementForm plans={plans ?? []} people={people} />
    </div>
  );
}
