import { createClient as createServiceClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";

export interface PushMessage {
  title: string;
  body: string;
  url: string;
}

// Sends a Web Push to every device the contact has subscribed, in their own
// language. Expired subscriptions (404/410 from the push service) are
// cleaned up along the way. Returns how many devices it reached.
export async function sendPushToContact(
  contactId: string,
  buildMessage: (dict: Dictionary, locale: Locale) => PushMessage,
): Promise<number> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("contact_id", contactId);

  if (!subscriptions || subscriptions.length === 0) return 0;

  const { data: contact } = await supabase
    .from("contacts")
    .select("preferred_locale")
    .eq("id", contactId)
    .maybeSingle();

  const locale: Locale =
    contact?.preferred_locale === "ca" || contact?.preferred_locale === "en"
      ? contact.preferred_locale
      : "es";
  const message = buildMessage(getDictionary(locale), locale);

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(message),
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }),
  );

  return sent;
}
