"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { adminActionContext } from "@/lib/admin-action";
import {
  hasAnyAnnouncementText,
  pickAnnouncementText,
  type AnnouncementTexts,
} from "@/lib/announcements";
import { sendTransactionalEmails, type SendEmailInput } from "@/lib/email/resend";
import { brandedEmailHtml } from "@/lib/email/template";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { sendPushToContact } from "@/lib/push-server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

export type AnnouncementAudience = "all" | "coworkers" | "guests" | "plan" | "contacts";

export interface SendAnnouncementInput {
  audience: AnnouncementAudience;
  planId?: string;
  contactIds?: string[];
  texts: AnnouncementTexts;
  sendEmail: boolean;
  origin: string;
}

interface Recipient {
  id: string;
  email: string | null;
  first_name: string;
  preferred_locale: string | null;
}

// Who gets it. Archived people never do; admins only when picked by hand.
async function resolveRecipients(admin: SupabaseClient, input: SendAnnouncementInput): Promise<Recipient[]> {
  const [{ data: contacts }, { data: admins }] = await Promise.all([
    admin.from("contacts").select("id, email, first_name, preferred_locale").eq("status", "active"),
    admin.from("users").select("contact_id").eq("role", "admin"),
  ]);
  const active = (contacts ?? []) as Recipient[];
  const adminIds = new Set((admins ?? []).map((a) => a.contact_id as string));

  if (input.audience === "contacts") {
    const chosen = new Set(input.contactIds ?? []);
    return active.filter((c) => chosen.has(c.id));
  }

  const community = active.filter((c) => !adminIds.has(c.id));
  if (input.audience === "all") return community;

  // Coworkers = a plan in force today, own or shared (same rule as booking).
  const { data: coworkerRows } = await admin.rpc("get_active_coworkers_directory");
  const coworkerIds = new Set(((coworkerRows ?? []) as { id: string }[]).map((r) => r.id));
  if (input.audience === "coworkers") return community.filter((c) => coworkerIds.has(c.id));
  if (input.audience === "guests") return community.filter((c) => !coworkerIds.has(c.id));

  // One plan: its holders plus whoever shares their hours.
  const today = utcIsoToZonedDateAndMinutes(new Date().toISOString()).date;
  const { data: memberships } = await admin
    .from("memberships")
    .select("contact_id, quota_account_id")
    .eq("plan_id", input.planId ?? "")
    .eq("status", "active")
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`);
  const accountIds = (memberships ?? []).map((m) => m.quota_account_id as string);
  const { data: shares } = accountIds.length
    ? await admin.from("quota_account_members").select("contact_id").in("quota_account_id", accountIds)
    : { data: [] };
  const planIds = new Set([
    ...(memberships ?? []).map((m) => m.contact_id as string),
    ...(shares ?? []).map((s) => s.contact_id as string),
  ]);
  return community.filter((c) => planIds.has(c.id));
}

export async function sendAnnouncement(
  input: SendAnnouncementInput,
): Promise<{ error: string | null; sent?: number }> {
  const { dict, current, admin } = await adminActionContext();
  if (!admin || !current) return { error: dict.errors.notAuthorized };
  const t = dict.admin.announcements;
  if (!hasAnyAnnouncementText(input.texts)) return { error: t.textRequired };

  const recipients = await resolveRecipients(admin, input);
  if (recipients.length === 0) return { error: t.noRecipients };

  const clean = (s: string) => s.trim() || null;
  const { data: announcement, error } = await admin
    .from("announcements")
    .insert({
      title_es: clean(input.texts.es.title),
      body_es: clean(input.texts.es.body),
      title_ca: clean(input.texts.ca.title),
      body_ca: clean(input.texts.ca.body),
      title_en: clean(input.texts.en.title),
      body_en: clean(input.texts.en.body),
      audience_type: input.audience,
      audience_plan_id: input.audience === "plan" ? input.planId : null,
      send_email: input.sendEmail,
      recipient_count: recipients.length,
      sent_by: current.contactId,
    })
    .select("id")
    .single();
  if (error || !announcement) return { error: dict.admin.userDetail.error };

  await admin.from("notifications").insert(
    recipients.map((r) => ({
      recipient_contact_id: r.id,
      type: "announcement",
      title: "ANNOUNCEMENT",
      body: "ANNOUNCEMENT",
      link_path: null,
      related_id: announcement.id,
    })),
  );

  await Promise.all(
    recipients.map((r) =>
      sendPushToContact(r.id, (_d, locale) => {
        const text = pickAnnouncementText(input.texts, locale)!;
        return { title: text.title, body: text.body.slice(0, 180), url: "/" };
      }),
    ),
  );

  if (input.sendEmail) {
    const emails: SendEmailInput[] = recipients
      .filter((r) => r.email)
      .map((r) => {
        const locale: Locale = r.preferred_locale === "ca" || r.preferred_locale === "en" ? r.preferred_locale : "es";
        const text = pickAnnouncementText(input.texts, locale)!;
        const d = getDictionary(locale);
        return {
          to: r.email!,
          subject: text.title,
          html: brandedEmailHtml({
            heading: text.title,
            paragraphs: [d.emails.greeting(r.first_name.trim()), ...text.body.split(/\n{2,}/)],
            cta: { label: d.admin.announcements.openApp, url: input.origin },
          }),
        };
      });
    await sendTransactionalEmails(emails);
  }

  return { error: null, sent: recipients.length };
}
