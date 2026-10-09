"use client";

import { useState, type FormEvent } from "react";
import { setMyNewsletter, updateMyProfile, type MyProfileInput } from "@/app/(coworker)/perfil/datos/actions";
import { Switch } from "@/components/admin/person/Switch";
import { useI18n } from "@/lib/i18n/context";

const inputClass =
  "w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark";

export function MyProfileForm({
  email,
  newsletter,
  initial,
}: {
  email: string;
  newsletter: boolean;
  initial: MyProfileInput;
}) {
  const { dict, locale } = useI18n();
  const t = dict.perfil;
  const [subscribed, setSubscribed] = useState(newsletter);
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  async function toggleNewsletter(value: boolean) {
    setNewsletterBusy(true);
    const result = await setMyNewsletter(value);
    setNewsletterBusy(false);
    if (result.error) setError(result.error);
    else setSubscribed(value);
  }
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<MyProfileInput>) => {
    setValues((v) => ({ ...v, ...patch }));
    setStatus("idle");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    // Language comes from the switcher at the top, not from this form.
    const result = await updateMyProfile({ ...values, preferredLocale: locale });
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("saved");
  }

  const field = (id: keyof MyProfileInput, label: string, type = "text", required = false) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && " *"}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={values[id]}
        onChange={(e) => set({ [id]: e.target.value })}
        className={inputClass}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {field("firstName", t.firstName, "text", true)}
        {field("lastName", t.lastName)}
        {field("phone", t.phone, "tel")}
        {field("company", t.company)}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          {t.email}
        </label>
        <input id="email" value={email} disabled readOnly className={`${inputClass} bg-cream text-warm-gray`} />
        <p className="text-xs text-warm-gray">{t.emailHint}</p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-sand/40 pt-4">
        <span className="text-sm text-ink">{t.newsletter}</span>
        <Switch
          checked={subscribed}
          disabled={newsletterBusy}
          label={t.newsletter}
          onChange={toggleNewsletter}
        />
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {status === "saved" && <p className="text-sm text-emerald-700">{t.saved}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="flex w-full items-center justify-center rounded-xl bg-brown-dark py-3 text-sm font-medium text-white disabled:opacity-60 md:w-auto md:self-end md:px-8"
      >
        {status === "saving" ? t.saving : t.save}
      </button>
    </form>
  );
}
