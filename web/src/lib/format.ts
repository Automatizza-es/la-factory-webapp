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

// "Del 14 al 20 de septiembre de 2026" (or "Del 28 de sept. al 3 de oct. de
// 2026" when the week crosses a month boundary).
export function formatWeekRangeLong(
  startIso: string,
  endIso: string,
  locale: Locale = "es",
): string {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startDay = start.toLocaleDateString(INTL_LOCALE[locale], { day: "numeric" });
  const endDay = end.toLocaleDateString(INTL_LOCALE[locale], { day: "numeric" });
  const endMonth = end.toLocaleDateString(INTL_LOCALE[locale], { month: "long" });
  const endYear = end.toLocaleDateString(INTL_LOCALE[locale], { year: "numeric" });

  if (sameMonth) {
    return `Del ${startDay} al ${endDay} de ${endMonth} de ${endYear}`;
  }

  const startMonth = start.toLocaleDateString(INTL_LOCALE[locale], { month: "long" });
  return `Del ${startDay} de ${startMonth} al ${endDay} de ${endMonth} de ${endYear}`;
}

// Short one-line form for the compact pill nav, e.g. "14 – 20 septiembre 2026".
export function formatWeekRangePill(
  startIso: string,
  endIso: string,
  locale: Locale = "es",
): string {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startDay = start.toLocaleDateString(INTL_LOCALE[locale], { day: "numeric" });
  const endDay = end.toLocaleDateString(INTL_LOCALE[locale], { day: "numeric" });
  const endMonth = end.toLocaleDateString(INTL_LOCALE[locale], { month: "long" });
  const endYear = end.toLocaleDateString(INTL_LOCALE[locale], { year: "numeric" });

  if (sameMonth) {
    return `${startDay} – ${endDay} ${endMonth} ${endYear}`;
  }

  const startMonth = start.toLocaleDateString(INTL_LOCALE[locale], { month: "short" }).replace(".", "");
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
}

export function formatWeekdayShort(isoDate: string, locale: Locale = "es"): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const label = date.toLocaleDateString(INTL_LOCALE[locale], { weekday: "short" });
  return label.replace(".", "");
}

export function formatWeekdayNarrow(isoDate: string, locale: Locale = "es"): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(INTL_LOCALE[locale], { weekday: "narrow" }).toUpperCase();
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
