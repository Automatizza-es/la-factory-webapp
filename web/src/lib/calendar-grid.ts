// Shared layout constants for the day and week calendar grids so both
// stay pixel-for-pixel consistent (same hours, same line tiers).
export const GRID_START_MINUTES = 7 * 60;
export const GRID_END_MINUTES = 21 * 60;
export const SLOT_MINUTES = 15;
export const HOUR_PX = 80;
export const GRID_HEIGHT = ((GRID_END_MINUTES - GRID_START_MINUTES) / 60) * HOUR_PX;

export function toY(minutes: number): number {
  return ((minutes - GRID_START_MINUTES) / 60) * HOUR_PX;
}

export function hourMarks(): number[] {
  const list: number[] = [];
  for (let m = GRID_START_MINUTES; m <= GRID_END_MINUTES; m += 60) list.push(m);
  return list;
}

export interface GridLine {
  minute: number;
  major: boolean;
}

export function gridLines(): GridLine[] {
  const list: GridLine[] = [];
  for (let m = GRID_START_MINUTES; m <= GRID_END_MINUTES; m += 15) {
    list.push({ minute: m, major: m % 30 === 0 });
  }
  return list;
}

export function slotStarts(): number[] {
  const list: number[] = [];
  for (let m = GRID_START_MINUTES; m < GRID_END_MINUTES; m += SLOT_MINUTES) list.push(m);
  return list;
}
