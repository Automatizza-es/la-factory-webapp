"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
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

export async function resendCoworkerInvitation(invitationId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_resend_coworker_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) return { error: dict.errors.unknown };
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: dict.errors.unknown };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Bienvenido/a a La Factory Coworking",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Bienvenido/a a La Factory</h2>
          <p>Te han dado de alta como coworker en La Factory Coworking. Completa tu registro para activar tu cuenta:</p>
          <p><a href="${inviteLink}" style="display:inline-block;background:#5b4636;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Completar registro</a></p>
          <p>O copia y pega este enlace en tu navegador:<br>${inviteLink}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    return { error: dict.errors.unknown };
  }

  const supabase = await createClient();
  await supabase.rpc("admin_mark_invitation_sent", { p_invitation_id: invitationId });
  revalidatePath("/admin/coworkers");
  return { error: null };
}
