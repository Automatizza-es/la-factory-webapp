"use client";

import { useState, type FormEvent } from "react";
import { updateMyProfile, type MyProfileInput } from "@/app/(coworker)/perfil/datos/actions";
import { LOCALE_LABELS, locales } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";

const inputClass =
  "w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brown-dark";

export function MyProfileForm({ email, initial }: { email: string; initial: MyProfileInput }) {
  const t = useI18n().dict.perfil;
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
    const result = await updateMyProfile(values);
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    // A language change needs a full reload to re-render everything in it.
    if (values.preferredLocale !== initial.preferredLocale) {
      window.location.reload();
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

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{t.language}</span>
        <div className="flex gap-2">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => set({ preferredLocale: code })}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                values.preferredLocale === code
                  ? "border-brown-dark bg-cream text-brown-dark"
                  : "border-sand bg-white text-ink"
              }`}
            >
              {LOCALE_LABELS[code].name}
            </button>
          ))}
        </div>
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
