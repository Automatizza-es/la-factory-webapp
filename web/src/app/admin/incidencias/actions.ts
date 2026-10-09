"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import type { IncidentStatus } from "@/lib/data/incidents";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { sendPushToContact } from "@/lib/push-server";
import { createClient } from "@/lib/supabase/server";

const STATUSES: IncidentStatus[] = ["pending", "in_progress", "resolved"];

// Status + optional note. The RPC notifies the reporter in-app; push here.
export async function updateIncident(
  incidentId: string,
  status: IncidentStatus,
  note: string,
): Promise<{ error: string | null }> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") return { error: dict.errors.notAuthorized };
  if (!STATUSES.includes(status)) return { error: dict.errors.unknown };

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("admin_update_incident", { p_incident_id: incidentId, p_status: status, p_note: note })
    .single();
  if (error || !data) return { error: dict.admin.userDetail.error };

  const reporter = (data as { reporter_contact_id: string }).reporter_contact_id;
  if (reporter !== current.contactId) {
    await sendPushToContact(reporter, (d) => ({
      title: d.notifications.incidentUpdateTitle,
      body: note.trim() || d.notifications.incidentUpdateBody(d.incidents.status[status]),
      url: "/incidencias",
    }));
  }

  revalidatePath("/admin/incidencias");
  revalidatePath("/admin");
  revalidatePath("/incidencias");
  return { error: null };
}
