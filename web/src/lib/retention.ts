// How far back history lists go (Mis reservas, Mis paquetes, admin package
// list). Older records stay in the database; they just aren't loaded.
const HISTORY_MONTHS = 3;

// How long package photos (after pickup) and notifications are kept before
// the nightly /api/cleanup removes them.
export const CLEANUP_AFTER_DAYS = 30;

export function historySinceIso(): string {
  const since = new Date();
  since.setMonth(since.getMonth() - HISTORY_MONTHS);
  return since.toISOString();
}
