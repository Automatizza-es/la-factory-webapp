const COWORKING_TIME_ZONE = "Europe/Madrid";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Local getters (getFullYear/getHours/...) on a Date built from a
// toLocaleString(...) round-trip always return the components of the
// target time zone, regardless of the server's own time zone -- that's
// the trick both helpers below rely on.
function wallClockPartsInZone(instant: Date) {
  return new Date(instant.toLocaleString("en-US", { timeZone: COWORKING_TIME_ZONE }));
}

export function todayInMadrid(): string {
  return utcIsoToZonedDateAndMinutes(new Date().toISOString()).date;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Monday of the week containing dateStr (ISO weekday: 1 = Monday).
export function startOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const isoWeekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay() || 7;
  return addDays(dateStr, 1 - isoWeekday);
}

export function utcIsoToZonedDateAndMinutes(iso: string): { date: string; minutes: number } {
  const wall = wallClockPartsInZone(new Date(iso));
  return {
    date: `${wall.getFullYear()}-${pad(wall.getMonth() + 1)}-${pad(wall.getDate())}`,
    minutes: wall.getHours() * 60 + wall.getMinutes(),
  };
}

// Converts a wall-clock date+time meant as Europe/Madrid local time into
// the correct UTC instant, accounting for CET/CEST automatically.
export function zonedDateTimeToUtcIso(dateStr: string, timeStr: string): string {
  const naiveUtc = new Date(`${dateStr}T${timeStr}:00.000Z`);
  const wallInZone = wallClockPartsInZone(naiveUtc);
  const wallAsUtc = Date.UTC(
    wallInZone.getFullYear(),
    wallInZone.getMonth(),
    wallInZone.getDate(),
    wallInZone.getHours(),
    wallInZone.getMinutes(),
    wallInZone.getSeconds(),
  );
  const offsetMs = wallAsUtc - naiveUtc.getTime();
  return new Date(naiveUtc.getTime() - offsetMs).toISOString();
}
