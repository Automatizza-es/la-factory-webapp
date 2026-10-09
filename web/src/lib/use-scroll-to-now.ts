import { useEffect, type RefObject } from "react";
import { GRID_END_MINUTES, GRID_START_MINUTES, toY } from "@/lib/calendar-grid";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

// How much of the past to keep visible above "now" when jumping to it.
const LEAD_MINUTES = 60;
// Never shrink the scroll box below this, even on very short screens.
const MIN_HEIGHT_PX = 320;
// The part of `reserveBelowPx` that's there for the phone's bottom tab bar;
// given back when that bar is hidden (tablet/desktop).
const BOTTOM_NAV_ALLOWANCE_PX = 96;

// The hour grid lives in its own scroll box so the page header, date picker
// and room/day headings stay put. This sizes that box to fill the screen down
// to `reserveBelowPx` above the bottom edge (bottom nav + anything under the
// grid), and, when the view includes today, scrolls it so the current time
// is near the top. Re-runs when `viewKey` changes (another day or week).
export function useScrollToNow(
  scrollRef: RefObject<HTMLElement | null>,
  showsToday: boolean,
  viewKey: string,
  reserveBelowPx: number,
) {
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;

    function fit() {
      if (!box) return;
      const nav = document.querySelector<HTMLElement>("[data-bottom-nav]");
      const navShown = !!nav && nav.offsetHeight > 0;
      const reserve = navShown ? reserveBelowPx : reserveBelowPx - BOTTOM_NAV_ALLOWANCE_PX;
      const available = window.innerHeight - box.getBoundingClientRect().top - reserve;
      box.style.maxHeight = `${Math.max(available, MIN_HEIGHT_PX)}px`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [scrollRef, reserveBelowPx]);

  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    if (!showsToday) {
      box.scrollTop = 0;
      return;
    }

    const now = utcIsoToZonedDateAndMinutes(new Date().toISOString()).minutes;
    const target = Math.min(Math.max(now - LEAD_MINUTES, GRID_START_MINUTES), GRID_END_MINUTES);
    box.scrollTop = toY(target);
  }, [scrollRef, showsToday, viewKey]);
}
