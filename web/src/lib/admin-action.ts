import { createClient as createServiceClient, type SupabaseClient } from "@supabase/supabase-js";
import { getCurrentCoworker, type CurrentCoworker } from "@/lib/data/coworker";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

// For admin server actions that write tables app users can only read under
// RLS: checks the caller is an admin, then hands back a service-key client.
// `admin` is null when the caller isn't allowed.
export async function adminActionContext(): Promise<{
  dict: Dictionary;
  current: CurrentCoworker | null;
  admin: SupabaseClient | null;
}> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") return { dict, current: null, admin: null };
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  return { dict, current, admin };
}
