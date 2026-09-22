"use client";

import { useState, type FormEvent } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";
import { LOCALE_LABELS, locales } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";

interface OnboardingFormProps {
  token: string;
  email: string;
}

const inputClass =
  "w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark";

export function OnboardingForm({ token, email }: OnboardingFormProps) {
  const { locale, dict } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nif, setNif] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLocale, setPreferredLocale] = useState<Locale>(locale);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await completeOnboarding({
      token,
      firstName,
      lastName,
      nif,
      companyName,
      phone,
      preferredLocale,
      marketingConsent,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="firstName" className="text-sm font-medium text-ink">
          {dict.onboarding.firstName} *
        </label>
        <input
          id="firstName"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lastName" className="text-sm font-medium text-ink">
          {dict.onboarding.lastName} *
        </label>
        <input
          id="lastName"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nif" className="text-sm font-medium text-ink">
          {dict.onboarding.nif} *
        </label>
        <input
          id="nif"
          required
          value={nif}
          onChange={(e) => setNif(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="companyName" className="text-sm font-medium text-ink">
          {dict.onboarding.companyName}{" "}
          <span className="font-normal text-warm-gray">({dict.onboarding.optional})</span>
        </label>
        <input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          {dict.onboarding.phone} *
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          {dict.onboarding.email}
        </label>
        <input id="email" value={email} disabled readOnly className={`${inputClass} bg-cream text-warm-gray`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{dict.onboarding.language}</span>
        <div className="flex gap-2">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setPreferredLocale(code)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                preferredLocale === code
                  ? "border-brown-dark bg-cream text-brown-dark"
                  : "border-sand bg-white text-ink"
              }`}
            >
              {LOCALE_LABELS[code].name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-warm-gray">
        {dict.onboarding.privacyText}{" "}
        <a
          href="https://lafactorycoworking.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brown-dark underline"
        >
          {dict.onboarding.privacyLinkLabel}
        </a>
        .
      </p>

      <label className="flex items-start gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand text-brown-dark focus:ring-brown-dark"
        />
        {dict.onboarding.marketingConsent}
      </label>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? dict.onboarding.submitting : dict.onboarding.submit}
      </button>
    </form>
  );
}
