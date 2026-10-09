"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { INCIDENT_CATEGORIES, type IncidentCategory } from "@/lib/data/incidents";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { sendPushToContact } from "@/lib/push-server";
import { createClient } from "@/lib/supabase/server";

export interface ReportIncidentInput {
  category: IncidentCategory;
  description: string;
  imagePath: string | null;
}

export async function reportIncident(input: ReportIncidentInput): Promise<{ error: string | null }> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) return { error: dict.errors.notAuthorized };
  if (!input.description.trim()) return { error: dict.incidents.descriptionRequired };
  if (!INCIDENT_CATEGORIES.includes(input.category)) return { error: dict.errors.unknown };

  // The RPC also creates the in-app notification for every admin.
  const supabase = await createClient();
  const { error } = await supabase.rpc("report_incident", {
    p_category: input.category,
    p_description: input.description,
    p_image_path: input.imagePath,
  });
  if (error) return { error: dict.errors.unknown };

  // Push to the admins, each in their own language.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: admins } = await admin.from("users").select("contact_id").eq("role", "admin");
  const summary = input.description.trim().slice(0, 100);
  await Promise.all(
    (admins ?? []).map((a) =>
      sendPushToContact(a.contact_id as string, (d) => ({
        title: d.notifications.incidentNewTitle,
        body: `${d.incidents.categories[input.category]} · ${summary}`,
        url: "/admin/incidencias",
      })),
    ),
  );

  revalidatePath("/incidencias");
  revalidatePath("/admin/incidencias");
  revalidatePath("/admin");
  return { error: null };
}
