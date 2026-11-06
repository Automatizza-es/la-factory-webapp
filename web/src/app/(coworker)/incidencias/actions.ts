"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { APP_ORIGIN } from "@/lib/app-origin";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { INCIDENT_CATEGORIES, type IncidentCategory } from "@/lib/data/incidents";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { brandedEmailHtml } from "@/lib/email/template";
import { deliverIncidentAdminAlerts, type IncidentAdminRow } from "@/lib/incident-alerts";
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
  if (input.description.length > 2000) return { error: dict.errors.unknown };
  // Photos must be in the reporter's own folder (as IncidentForm uploads them).
  if (input.imagePath && !input.imagePath.startsWith(`${current.contactId}/`)) {
    return { error: dict.errors.unknown };
  }
  if (!INCIDENT_CATEGORIES.includes(input.category)) return { error: dict.errors.unknown };

  // The RPC also creates the in-app notification for every admin.
  const supabase = await createClient();
  const { data: incident, error } = await supabase.rpc("report_incident", {
    p_category: input.category,
    p_description: input.description,
    p_image_path: input.imagePath,
  }).single<{ id: string }>();
  if (error || !incident) return { error: dict.errors.unknown };

  // The same active-admin audience receives push and email, each in their
  // language. Neither an audience-query failure nor a transport failure may
  // turn a successfully saved report into a second submission.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: admins, error: audienceError } = await admin.from("users")
    .select("contact_id, role, contacts!inner(first_name, email, preferred_locale, status)")
    .eq("role", "admin")
    .eq("contacts.status", "active");
  if (audienceError) console.error("Could not load incident administrator recipients");
  const summary = input.description.trim().slice(0, 100);
  const delivery = await deliverIncidentAdminAlerts((admins ?? []) as unknown as IncidentAdminRow[], {
    push: (recipient) => sendPushToContact(recipient.contactId, (d) => ({
        title: d.notifications.incidentNewTitle,
        body: `${d.incidents.categories[input.category]} · ${summary}`,
        url: "/admin/incidencias",
      })),
    email: async (recipient) => {
      const d = getDictionary(recipient.locale);
      const message = {
        to: recipient.email!,
        subject: d.notifications.incidentNewTitle,
        html: brandedEmailHtml({
          heading: d.notifications.incidentNewTitle,
          paragraphs: [
            d.emails.greeting(recipient.firstName),
            `${d.incidents.reportedBy}: ${current.coworker.firstName}`,
            d.incidents.categories[input.category],
            input.description.trim(),
          ],
          cta: { label: d.incidents.title, url: `${APP_ORIGIN}/admin/incidencias` },
        }),
        idempotencyKey: `incident-new/${incident.id}/${recipient.contactId}`,
      };
      const result = await sendTransactionalEmail(message);
      if (!result.error) return true;
      if (result.error === "missing_api_key") return false;
      return !(await sendTransactionalEmail(message)).error;
    },
  });
  if (delivery.emailFailed || delivery.pushFailed) {
    console.error("Incident administrator delivery failures", delivery);
  }

  revalidatePath("/incidencias");
  revalidatePath("/admin/incidencias");
  revalidatePath("/admin");
  return { error: null };
}
