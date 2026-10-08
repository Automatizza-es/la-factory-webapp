import { useEffect, type RefObject } from "react";
import { GRID_END_MINUTES, GRID_START_MINUTES, toY } from "@/lib/calendar-grid";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

// How much of the past to keep visible above "now" when jumping to it.
const LEAD_MINUTES = 60;

// When the calendar shows today, scroll the page so the current time is near
// the top instead of making people scroll down from 7:00. The page itself
// scrolls (not an inner box), so this positions the window. Runs again
// whenever `viewKey` changes (another day or week being shown).
export function useScrollToNow(
  gridRef: RefObject<HTMLElement | null>,
  showsToday: boolean,
  viewKey: string,
) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!showsToday || !grid) return;

    const now = utcIsoToZonedDateAndMinutes(new Date().toISOString()).minutes;
    const target = Math.min(Math.max(now - LEAD_MINUTES, GRID_START_MINUTES), GRID_END_MINUTES);
    if (target <= GRID_START_MINUTES) return;

    const gridTop = grid.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: gridTop + toY(target) });
  }, [gridRef, showsToday, viewKey]);
}
