// Kept separate from React so keyboard close/reopen, viewport panning and
// desktop transitions can be exercised without a signed-in device session.
export function observeMobileViewport(frame: HTMLElement, browser: Window) {
  const mobile = browser.matchMedia("(width < 48rem)");
  const viewport = browser.visualViewport;
  let pendingFrame = 0;

  function update() {
    pendingFrame = 0;
    if (!mobile.matches || (viewport && viewport.scale !== 1)) {
      frame.style.removeProperty("--app-viewport-height");
      frame.style.removeProperty("--app-viewport-top");
      return;
    }
    const height = viewport?.height ?? browser.innerHeight;
    const top = viewport?.offsetTop ?? 0;
    if (height > 0) frame.style.setProperty("--app-viewport-height", `${height}px`);
    frame.style.setProperty("--app-viewport-top", `${Math.max(0, top)}px`);
  }

  function scheduleUpdate() {
    if (!pendingFrame) pendingFrame = browser.requestAnimationFrame(update);
  }

  update();
  mobile.addEventListener("change", scheduleUpdate);
  browser.addEventListener("resize", scheduleUpdate);
  browser.addEventListener("pageshow", scheduleUpdate);
  browser.addEventListener("focus", scheduleUpdate);
  browser.document.addEventListener("visibilitychange", scheduleUpdate);
  viewport?.addEventListener("resize", scheduleUpdate);
  viewport?.addEventListener("scroll", scheduleUpdate);

  return () => {
    browser.cancelAnimationFrame(pendingFrame);
    mobile.removeEventListener("change", scheduleUpdate);
    browser.removeEventListener("resize", scheduleUpdate);
    browser.removeEventListener("pageshow", scheduleUpdate);
    browser.removeEventListener("focus", scheduleUpdate);
    browser.document.removeEventListener("visibilitychange", scheduleUpdate);
    viewport?.removeEventListener("resize", scheduleUpdate);
    viewport?.removeEventListener("scroll", scheduleUpdate);
    frame.style.removeProperty("--app-viewport-height");
    frame.style.removeProperty("--app-viewport-top");
  };
}
