"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import {
  sendTransactionalEmail,
  sendTransactionalEmails,
  type SendEmailInput,
} from "@/lib/email/resend";
import { brandedEmailHtml } from "@/lib/email/template";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

interface ActionResult<T = undefined> {
  error: string | null;
  data?: T;
}

function inviteUrl(origin: string, token: string) {
  return `${origin}/invite/${token}`;
}

type InvitationKind = "onboarding" | "welcome";

interface InvitationRecipient {
  email: string;
  first_name: string;
  preferred_locale: string | null;
}

// "onboarding": a brand-new coworker who still has to fill in the form.
// "welcome": an existing (imported) coworker who only has to set a password.
// Written in the recipient's own language.
function invitationEmail(
  kind: InvitationKind,
  recipient: InvitationRecipient,
  link: string,
): SendEmailInput {
  const locale: Locale =
    recipient.preferred_locale === "ca" || recipient.preferred_locale === "en"
      ? recipient.preferred_locale
      : "es";
  const t = getDictionary(locale).emails;
  const content = kind === "welcome" ? t.welcome : t.invite;
  const footnotes = kind === "welcome" ? [t.welcome.validity] : [];

  return {
    to: recipient.email,
    subject: content.subject,
    html: brandedEmailHtml({
      heading: content.heading,
      paragraphs: [t.greeting(recipient.first_name.trim()), content.body],
      cta: { label: content.cta, url: link },
      footnotes: [...footnotes, `${t.linkFallback} ${link}`],
    }),
  };
}

export interface CreateInvitationInput {
  email: string;
  planCode: "fixed" | "hot_desk";
  startDate: string;
  origin: string;
}

export interface CreateInvitationData {
  invitationId: string;
  token: string;
  inviteLink: string;
}

export async function createCoworkerInvitation(
  input: CreateInvitationInput,
): Promise<ActionResult<CreateInvitationData>> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("admin_create_coworker_invitation", {
      p_email: input.email,
      p_plan_code: input.planCode,
      p_start_date: input.startDate,
    })
    .single();

  if (error || !data) {
    const code = error?.message;
    const message =
      code === "EMAIL_ALREADY_EXISTS"
        ? dict.admin.newCoworker.emailAlreadyExists
        : dict.errors.unknown;
    return { error: message };
  }

  const row = data as { id: string; token: string };
  revalidatePath("/admin/coworkers");
  return {
    error: null,
    data: { invitationId: row.id, token: row.token, inviteLink: inviteUrl(input.origin, row.token) },
  };
}

// Extends the invitation another 14 days and emails the link again.
export async function resendCoworkerInvitation(
  invitationId: string,
  origin: string,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("admin_resend_coworker_invitation", { p_invitation_id: invitationId })
    .single();

  if (error || !data) return { error: dict.errors.unknown };

  const row = data as { contact_id: string; token: string; kind: InvitationKind };
  const { data: contact } = await supabase
    .from("contacts")
    .select("email, first_name, preferred_locale")
    .eq("id", row.contact_id)
    .single();

  if (!contact?.email) return { error: dict.errors.unknown };

  const { error: sendError } = await sendTransactionalEmail(
    invitationEmail(row.kind, contact as InvitationRecipient, inviteUrl(origin, row.token)),
  );
  if (sendError) return { error: dict.errors.unknown };

  await supabase.rpc("admin_mark_invitation_sent", { p_invitation_id: invitationId });
  revalidatePath("/admin/coworkers");
  return { error: null };
}

export async function cancelCoworkerInvitation(invitationId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_cancel_coworker_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) return { error: dict.errors.unknown };
  revalidatePath("/admin/coworkers");
  return { error: null };
}

export async function sendCoworkerInvitationEmail(
  invitationId: string,
  email: string,
  inviteLink: string,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  // Just created by the admin: no name yet, default language.
  const { error: sendError } = await sendTransactionalEmail(
    invitationEmail("onboarding", { email, first_name: "", preferred_locale: null }, inviteLink),
  );

  if (sendError) {
    return { error: dict.errors.unknown };
  }

  const supabase = await createClient();
  await supabase.rpc("admin_mark_invitation_sent", { p_invitation_id: invitationId });
  revalidatePath("/admin/coworkers");
  return { error: null };
}

// Welcome emails for existing coworkers with no login yet. The RPC skips
// anyone who already has access or a live invitation, so pressing "send to
// everyone" twice doesn't email people twice. If the email send fails, the
// invitations just created are cancelled again so they go back to
// "Sin acceso" instead of looking sent.
export async function sendWelcomeInvitations(
  contactIds: string[],
  origin: string,
): Promise<ActionResult<{ sent: number }>> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_create_welcome_invitations", {
    p_contact_ids: contactIds,
  });
  if (error) return { error: dict.admin.coworkers.welcomeError };

  const invitations = (data ?? []) as { id: string; contact_id: string; token: string }[];
  if (invitations.length === 0) return { error: null, data: { sent: 0 } };

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, email, first_name, preferred_locale")
    .in(
      "id",
      invitations.map((i) => i.contact_id),
    );
  const contactById = new Map((contacts ?? []).map((c) => [c.id, c as InvitationRecipient & { id: string }]));

  const emails = invitations.flatMap((inv) => {
    const contact = contactById.get(inv.contact_id);
    return contact?.email ? [invitationEmail("welcome", contact, inviteUrl(origin, inv.token))] : [];
  });

  const { error: sendError } = await sendTransactionalEmails(emails);
  if (sendError) {
    await Promise.all(
      invitations.map((inv) =>
        supabase.rpc("admin_cancel_coworker_invitation", { p_invitation_id: inv.id }),
      ),
    );
    revalidatePath("/admin/coworkers");
    return { error: dict.admin.coworkers.welcomeError };
  }

  await Promise.all(
    invitations.map((inv) =>
      supabase.rpc("admin_mark_invitation_sent", { p_invitation_id: inv.id }),
    ),
  );
  revalidatePath("/admin/coworkers");
  return { error: null, data: { sent: emails.length } };
}
