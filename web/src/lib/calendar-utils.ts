function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toIso(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function parse(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(dateStr: string, days: number): string {
  const date = parse(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

// Monday-start week containing dateStr.
export function startOfWeek(dateStr: string): string {
  const date = parse(dateStr);
  const dow = date.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setUTCDate(date.getUTCDate() + diff);
  return toIso(date);
}

export function startOfMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return `${y}-${pad(m)}-01`;
}

export function addMonths(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, d));
  return toIso(date);
}

// One row per week (Monday-start), covering the full month with leading/
// trailing days from adjacent months so the grid aligns like a real
// calendar.
export function monthGridWeeks(dateStr: string): string[][] {
  const [y, m] = dateStr.split("-").map(Number);
  const firstOfMonth = `${y}-${pad(m)}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lastOfMonth = `${y}-${pad(m)}-${pad(lastDay)}`;

  let cursor = startOfWeek(firstOfMonth);
  const end = startOfWeek(lastOfMonth);
  const weeks: string[][] = [];

  while (cursor <= end) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    cursor = addDays(cursor, 7);
  }

  return weeks;
}
