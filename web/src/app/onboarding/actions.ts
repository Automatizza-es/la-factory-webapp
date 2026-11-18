"use server";

import { hasInvoiceDetails, type InvoiceDetails } from "@/lib/onboarding-invoice";
import { TEXT_LIMITS } from "@/lib/limits";
import { redirect } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { translateOnboardingError } from "@/lib/i18n/onboarding-errors";
import { MIN_PASSWORD_LENGTH, passwordErrorMessage } from "@/lib/password";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

export interface CompleteOnboardingInput extends InvoiceDetails {
  needsInvoice: boolean | null;
  token: string;
  firstName: string;
  lastName: string;
  phone: string;
  preferredLocale: Locale;
  marketingConsent: boolean;
  password: string;
}

export interface CompleteOnboardingResult {
  error: string | null;
}

export async function completeOnboarding(
  input: CompleteOnboardingInput,
): Promise<CompleteOnboardingResult> {
  const dict = getDictionary(await getLocale());
  if (typeof input.needsInvoice !== "boolean") return { error: dict.onboarding.invoiceChoiceRequired };
  if (input.needsInvoice && !hasInvoiceDetails(input)) return { error: dict.onboarding.invoiceDataRequired };
  if ((["address", "city", "postalCode", "province", "country"] as const)
    .some((key) => typeof input[key] !== "string" || input[key].length > TEXT_LIMITS[key])) {
    return { error: dict.onboarding.invoiceDataRequired };
  }
  const supabase = await createClient();

  // The invite link signed them in without a password: set it first, so a
  // failure here leaves the onboarding untouched and they can just retry.
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { error: dict.password.tooShort };
  }
  const { error: passwordError } = await supabase.auth.updateUser({ password: input.password });
  if (passwordError) {
    return { error: passwordErrorMessage(passwordError, dict.password) };
  }

  const { error } = await supabase.rpc("complete_coworker_onboarding", {
    p_token: input.token,
    p_first_name: input.firstName,
    p_last_name: input.lastName || null,
    p_nif: input.nif || null,
    p_company_name: input.companyName || null,
    p_needs_invoice: input.needsInvoice,
    p_address: input.address || null,
    p_city: input.city || null,
    p_postal_code: input.postalCode || null,
    p_province: input.province || null,
    p_country: input.country || null,
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
