"use server";

import { createClient } from "@/lib/supabase/server";

// Marks the signed-in coworker's pending welcome invitation (if any) as
// completed once they've set their password.
export async function completeMyWelcomeInvitation(): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("complete_my_welcome_invitation");
}
