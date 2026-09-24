"use server";

import { getCurrentCoworker } from "@/lib/data/coworker";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  error: string | null;
}

export async function updateNotificationPreferences(input: {
  bookingReminders: boolean;
  packages: boolean;
  events: boolean;
}): Promise<ActionResult> {
  const current = await getCurrentCoworker();
  if (!current) return { error: "NOT_AUTHORIZED" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_notification_preferences", {
    p_booking_reminders: input.bookingReminders,
    p_packages: input.packages,
    p_events: input.events,
  });

  return { error: error ? error.message : null };
}

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}): Promise<ActionResult> {
  const current = await getCurrentCoworker();
  if (!current) return { error: "NOT_AUTHORIZED" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: input.endpoint,
    p_p256dh: input.p256dh,
    p_auth: input.auth,
    p_user_agent: input.userAgent,
  });

  return { error: error ? error.message : null };
}

export async function deletePushSubscription(endpoint: string): Promise<ActionResult> {
  const current = await getCurrentCoworker();
  if (!current) return { error: "NOT_AUTHORIZED" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_push_subscription", { p_endpoint: endpoint });

  return { error: error ? error.message : null };
}
