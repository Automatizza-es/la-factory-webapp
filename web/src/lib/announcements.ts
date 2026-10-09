import type { Locale } from "@/lib/i18n/config";

export interface AnnouncementText {
  title: string;
  body: string;
}
export type AnnouncementTexts = Record<Locale, AnnouncementText>;

const FALLBACK_ORDER: Locale[] = ["es", "ca", "en"];

function isFilled(t: AnnouncementText | undefined): t is AnnouncementText {
  return !!t && t.title.trim() !== "" && t.body.trim() !== "";
}

// The recipient's language if it was written, otherwise the first language
// that was (ES, then CA, then EN).
export function pickAnnouncementText(texts: Partial<AnnouncementTexts>, locale: string): AnnouncementText | null {
  const own = texts[locale as Locale];
  if (isFilled(own)) return own;
  for (const l of FALLBACK_ORDER) {
    const t = texts[l];
    if (isFilled(t)) return t;
  }
  return null;
}

export function hasAnyAnnouncementText(texts: Partial<AnnouncementTexts>): boolean {
  return FALLBACK_ORDER.some((l) => isFilled(texts[l]));
}
