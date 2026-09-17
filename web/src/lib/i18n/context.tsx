"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

// Only `locale` (a plain string) crosses the server/client boundary as a
// prop. The dictionary itself is resolved here on the client because it
// contains functions (e.g. checkEmail), and RSC can't serialize those into
// a Client Component prop.
export function I18nProvider({
  locale,
  children,
}: { locale: Locale; children: React.ReactNode }) {
  const dict = useMemo(() => getDictionary(locale), [locale]);
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return value;
}
