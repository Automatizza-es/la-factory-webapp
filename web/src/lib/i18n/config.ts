export const locales = ["es", "ca", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const LOCALE_COOKIE = "lf-locale";

export const LOCALE_LABELS: Record<Locale, { name: string; code: string }> = {
  es: { name: "Castellano", code: "ES" },
  ca: { name: "Català", code: "CA" },
  en: { name: "English", code: "EN" },
};

export const INTL_LOCALE: Record<Locale, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-GB",
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
