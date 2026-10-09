"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export interface MyProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  preferredLocale: Locale;
}

export async function updateMyProfile(input: MyProfileInput): Promise<{ error: string | null }> {
  const dict = getDictionary(await getLocale());
  const current = await getCurrentCoworker();
  if (!current) return { error: dict.errors.notAuthorized };
  if (!input.firstName.trim()) return { error: dict.perfil.firstNameRequired };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_profile", {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_phone: input.phone,
    p_company_name: input.company,
    p_preferred_locale: input.preferredLocale,
  });
  if (error) return { error: dict.perfil.saveError };

  // The app language follows the profile language from now on.
  await setLocale(input.preferredLocale);
  revalidatePath("/", "layout");
  return { error: null };
}
