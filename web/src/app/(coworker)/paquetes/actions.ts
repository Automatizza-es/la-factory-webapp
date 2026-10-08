"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

// The recipient marks their own packages as picked up. The only collect RPC
// is admin-only, so this goes through the service key, scoped to packages
// addressed to the signed-in coworker that are still pending.
export async function markMyPackagesCollected(
  packageIds: string[],
): Promise<{ error: string | null }> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) return { error: dict.errors.notAuthorized };
  if (packageIds.length === 0) return { error: null };

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { error } = await admin
    .from("packages")
    .update({
      status: "collected",
      collected_at: new Date().toISOString(),
      collected_by: current.contactId,
    })
    .in("id", packageIds)
    .eq("recipient_contact_id", current.contactId)
    .eq("status", "pending");

  if (error) return { error: dict.packages.markError };

  revalidatePath("/paquetes");
  revalidatePath("/");
  revalidatePath("/admin/paquetes");
  return { error: null };
}
