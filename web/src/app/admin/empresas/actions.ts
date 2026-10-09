"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export interface CompanyInput {
  name: string;
  tax_id: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  billing_email: string;
  holded_contact_id: string;
  notes: string;
}

// Create (id null) or update a billing company. companies is admin-only and
// read-only under RLS, so the write uses the service key after the check.
export async function saveCompany(
  id: string | null,
  input: CompanyInput,
): Promise<{ error: string | null; id?: string }> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current || current.role !== "admin") return { error: dict.errors.notAuthorized };
  if (!input.name.trim()) return { error: dict.admin.companies.nameRequired };

  const row = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v]),
  );
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = id
    ? await admin.from("companies").update(row).eq("id", id).select("id").single()
    : await admin.from("companies").insert(row).select("id").single();

  if (error || !data) return { error: dict.admin.userDetail.error };
  revalidatePath("/admin/empresas");
  return { error: null, id: data.id };
}
