"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_notification_read", { p_notification_id: notificationId });
  return { error: error ? error.message : null };
}
