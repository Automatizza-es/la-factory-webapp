"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface ActionResult {
  error: string | null;
}

export interface RegisterPackageInput {
  recipientContactId: string;
  imagePath: string;
  note: string;
  appOrigin: string;
}

export async function registerPackage(input: RegisterPackageInput): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("admin_register_package", {
      p_recipient_contact_id: input.recipientContactId,
      p_image_path: input.imagePath,
      p_note: input.note || null,
    })
    .single();

  if (error || !data) {
    return { error: dict.errors.unknown };
  }

  const pkg = data as { id: string; received_at: string };

  const { data: recipient } = await supabase
    .from("contacts")
    .select("first_name, email, preferred_locale")
    .eq("id", input.recipientContactId)
    .maybeSingle();

  if (recipient?.email) {
    const recipientLocale =
      recipient.preferred_locale === "ca" || recipient.preferred_locale === "en"
        ? recipient.preferred_locale
        : "es";
    const recipientDict = getDictionary(recipientLocale);
    const zoned = utcIsoToZonedDateAndMinutes(pkg.received_at);
    const whenText = `${formatDateLong(zoned.date, recipientLocale)} · ${minutesToTime(zoned.minutes)}`;

    await sendTransactionalEmail({
      to: recipient.email,
      subject: recipientDict.packages.emailSubject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>${recipientDict.packages.emailSubject}</h2>
          <p>${recipientDict.packages.emailGreeting(recipient.first_name)}</p>
          <p>${recipientDict.packages.emailBody}</p>
          <p style="color:#8a7a6d;font-size:14px;">${whenText}</p>
          <p><a href="${input.appOrigin}/paquetes" style="display:inline-block;background:#5b4636;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">${recipientDict.packages.emailCta}</a></p>
        </div>
      `,
    });
  }

  revalidatePath("/admin/paquetes");
  return { error: null };
}

export async function markPackageCollected(packageId: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") {
    return { error: dict.errors.notAuthorized };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_mark_package_collected", { p_package_id: packageId });

  if (error) return { error: dict.errors.unknown };
  revalidatePath("/admin/paquetes");
  return { error: null };
}
