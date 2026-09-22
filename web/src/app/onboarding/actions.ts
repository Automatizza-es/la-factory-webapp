"use server";

import { redirect } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { translateOnboardingError } from "@/lib/i18n/onboarding-errors";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

export interface CompleteOnboardingInput {
  token: string;
  firstName: string;
  lastName: string;
  nif: string;
  companyName: string;
  phone: string;
  preferredLocale: Locale;
  marketingConsent: boolean;
}

export interface CompleteOnboardingResult {
  error: string | null;
}

export async function completeOnboarding(
  input: CompleteOnboardingInput,
): Promise<CompleteOnboardingResult> {
  const dict = getDictionary(await getLocale());
  const supabase = await createClient();

  const { error } = await supabase.rpc("complete_coworker_onboarding", {
    p_token: input.token,
    p_first_name: input.firstName,
    p_last_name: input.lastName || null,
    p_nif: input.nif || null,
    p_company_name: input.companyName || null,
    p_phone: input.phone || null,
    p_preferred_locale: input.preferredLocale,
    p_marketing_consent: input.marketingConsent,
  });

  if (error) {
    return { error: translateOnboardingError(error, dict.errors, dict.onboarding) };
  }

  await setLocale(input.preferredLocale);
  redirect("/");
}
