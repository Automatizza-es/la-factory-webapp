import type { SupabaseClient } from "@supabase/supabase-js";

// Until launch, the app only reaches people who already have a login:
// coworkers imported without one sit in the user list but get no
// announcements and can't be picked as a package recipient (which would
// email them). Set to false when we send everyone their welcome.
export const PRELAUNCH = true;

// Contact ids of everyone with an app login. Needs a service-key client:
// app users can only read their own users row.
export async function contactIdsWithLogin(admin: SupabaseClient): Promise<Set<string>> {
  const { data } = await admin.from("users").select("contact_id");
  return new Set((data ?? []).map((u) => u.contact_id as string));
}
