import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

export function formatMinutesAsHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} h`;
  return `${hours} h ${remainder} min`;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${remainder}`;
}

export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  return `${minutesToTime(startMinutes)}–${minutesToTime(endMinutes)}`;
}

export function formatDateLong(isoDate: string, locale: Locale = "es"): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const formatted = date.toLocaleDateString(INTL_LOCALE[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateShort(
  isoDate: string,
  locale: Locale = "es",
): { day: string; month: string } {
  const date = new Date(`${isoDate}T00:00:00`);
  return {
    day: date.toLocaleDateString(INTL_LOCALE[locale], { day: "2-digit" }),
    month: date
      .toLocaleDateString(INTL_LOCALE[locale], { month: "short" })
      .replace(".", "")
      .toUpperCase(),
  };
}
