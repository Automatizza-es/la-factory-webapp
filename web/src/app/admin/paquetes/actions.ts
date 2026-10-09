"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getAppOrigin } from "@/lib/app-origin";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { brandedEmailHtml } from "@/lib/email/template";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { sendPushToContact } from "@/lib/push-server";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface ActionResult {
  error: string | null;
}

export interface RegisterPackageInput {
  recipientContactId: string;
  imagePath: string;
  note: string;
}

// Callable by any signed-in coworker, not just admin: whoever's around when
// a delivery arrives is the one who registers it.
export async function registerPackage(input: RegisterPackageInput): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  // Guests (no plan right now) aren't in the space day to day.
  if (!current || current.access === "guest") {
    return { error: dict.errors.notAuthorized };
  }
  // Photos are uploaded under packages/ by PackageForm.
  if (!input.imagePath.startsWith("packages/")) {
    return { error: dict.errors.unknown };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("register_package", {
      p_recipient_contact_id: input.recipientContactId,
      p_image_path: input.imagePath,
      p_note: input.note || null,
    })
    .single();

  if (error || !data) {
    return { error: dict.errors.unknown };
  }

  const pkg = data as { id: string; received_at: string };

  // contacts RLS only lets a coworker read their own row, so a non-admin
  // registering a package for someone else can't see the recipient's email.
  // The package is already registered by now, so read it with the service key.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: recipient } = await admin
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

    // Branded template (escapes names); link built from the server's own
    // origin, never from what the browser sent.
    await sendTransactionalEmail({
      to: recipient.email,
      subject: recipientDict.packages.emailSubject,
      html: brandedEmailHtml({
        heading: recipientDict.packages.emailSubject,
        paragraphs: [recipientDict.packages.emailGreeting(recipient.first_name), recipientDict.packages.emailBody],
        cta: { label: recipientDict.packages.emailCta, url: `${await getAppOrigin()}/paquetes` },
        footnotes: [`${whenText} · ${recipientDict.packages.receivedBy(current.coworker.firstName)}`],
      }),
    });
  }

  // Same opt-out as the in-app notification: no preferences row means yes.
  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("packages")
    .eq("contact_id", input.recipientContactId)
    .maybeSingle();

  if (prefs?.packages ?? true) {
    await sendPushToContact(input.recipientContactId, (pushDict, pushLocale) => {
      const zoned = utcIsoToZonedDateAndMinutes(pkg.received_at);
      const when = `${formatDateLong(zoned.date, pushLocale)} · ${minutesToTime(zoned.minutes)}`;
      return {
        title: pushDict.notifications.packageReceivedTitle,
        body: pushDict.notifications.packageReceivedBody(when),
        url: "/paquetes",
      };
    });
  }

  revalidatePath("/admin/paquetes");
  revalidatePath("/paquetes");
  revalidatePath("/");
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
