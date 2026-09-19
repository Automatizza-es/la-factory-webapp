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

const LAST_MINUTE_OF_DAY = 23 * 60 + 59;

// Now, rounded up to the next 5-minute mark so the default is still valid
// ("must start in the future") by the time the page finishes loading.
export function defaultStartTime(): string {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.ceil((minutes + 1) / 5) * 5;
  return minutesToTime(Math.min(rounded, LAST_MINUTE_OF_DAY));
}

export function defaultEndTime(startTime: string, durationMinutes = 60): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  return minutesToTime(Math.min(hours * 60 + minutes + durationMinutes, LAST_MINUTE_OF_DAY));
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

// Shorter than formatDateLong (no weekday, no "de" joiners) so it fits on
// one line in the compact pill-shaped date nav.
export function formatDatePill(isoDate: string, locale: Locale = "es"): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const day = date.toLocaleDateString(INTL_LOCALE[locale], { day: "numeric" });
  const month = date.toLocaleDateString(INTL_LOCALE[locale], { month: "long" });
  const year = date.toLocaleDateString(INTL_LOCALE[locale], { year: "numeric" });
  return `${day} ${month} ${year}`;
}

export function formatWeekdayShort(isoDate: string, locale: Locale = "es"): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const label = date.toLocaleDateString(INTL_LOCALE[locale], { weekday: "short" });
  return label.replace(".", "");
}

export function formatDayNumber(isoDate: string): string {
  return isoDate.slice(-2);
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
