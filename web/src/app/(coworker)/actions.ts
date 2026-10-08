"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getMyNotifications, type NotificationItem } from "@/lib/data/notifications";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

// Polled by the bell so new notifications show up without a page reload.
export async function fetchMyNotifications(): Promise<NotificationItem[]> {
  const current = await getCurrentCoworker();
  if (!current) return [];

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  return getMyNotifications(supabase, current.contactId, dict.notifications, locale);
}

// Opening the bell counts as having seen everything in it. notifications
// RLS is select-only for coworkers, so the update goes through the service
// key, scoped to the signed-in coworker's own rows.
export async function markAllNotificationsRead(): Promise<{ error: string | null }> {
  const current = await getCurrentCoworker();
  if (!current) return { error: "NOT_AUTHORIZED" };

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { error } = await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_contact_id", current.contactId)
    .is("read_at", null);

  return { error: error ? error.message : null };
}
