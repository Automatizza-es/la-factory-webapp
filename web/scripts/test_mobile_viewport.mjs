import assert from "node:assert/strict";
import test from "node:test";
import { observeMobileViewport } from "../src/lib/mobile-viewport.ts";

function fixture(withVisualViewport = true) {
  const mobile = Object.assign(new EventTarget(), { matches: true });
  const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 });
  const callbacks = new Map();
  let sequence = 0;
  const browser = Object.assign(new EventTarget(), {
    innerHeight: 844,
    visualViewport: withVisualViewport ? viewport : null,
    document: new EventTarget(),
    matchMedia: () => mobile,
    requestAnimationFrame: (callback) => { callbacks.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: (id) => callbacks.delete(id),
  });
  const properties = new Map();
  const frame = { style: {
    setProperty: (key, value) => properties.set(key, value),
    removeProperty: (key) => properties.delete(key),
  } };
  const stop = observeMobileViewport(frame, browser);
  const flush = () => { for (const [id, callback] of callbacks) { callbacks.delete(id); callback(); } };
  return { browser, mobile, viewport, properties, callbacks, flush, stop };
}

test("keyboard open and close restore the full height and remove the upward offset", () => {
  const f = fixture();
  assert.equal(f.properties.get("--app-viewport-height"), "844px");
  Object.assign(f.viewport, { height: 344, offsetTop: 210 });
  f.viewport.dispatchEvent(new Event("resize"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "344px");
  assert.equal(f.properties.get("--app-viewport-top"), "210px");
  Object.assign(f.viewport, { height: 844, offsetTop: 0 });
  f.viewport.dispatchEvent(new Event("resize"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "844px");
  assert.equal(f.properties.get("--app-viewport-top"), "0px");
  f.viewport.height = 844;
  f.browser.document.dispatchEvent(new Event("visibilitychange"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "844px");
  f.stop();
});

test("iOS panning and restoring an installed app update the visible bounds", () => {
  const f = fixture();
  f.viewport.offsetTop = 48;
  f.viewport.dispatchEvent(new Event("scroll"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-top"), "48px");
  Object.assign(f.viewport, { height: 740, offsetTop: 0 });
  f.browser.dispatchEvent(new Event("pageshow"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "740px");
  assert.equal(f.properties.get("--app-viewport-top"), "0px");
  f.stop();
});

test("desktop transition clears mobile dimensions and returning to mobile recalculates them", () => {
  const f = fixture();
  f.mobile.matches = false;
  f.mobile.dispatchEvent(new Event("change"));
  f.flush();
  assert.equal(f.properties.size, 0);
  f.mobile.matches = true;
  f.viewport.height = 568;
  f.mobile.dispatchEvent(new Event("change"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "568px");
  f.stop();
});

test("pinch zoom is left to the browser instead of shrinking the app to the zoomed viewport", () => {
  const f = fixture();
  Object.assign(f.viewport, { scale: 2, height: 422 });
  f.viewport.dispatchEvent(new Event("resize"));
  f.flush();
  assert.equal(f.properties.size, 0);
  Object.assign(f.viewport, { scale: 1, height: 844 });
  f.viewport.dispatchEvent(new Event("resize"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "844px");
  f.stop();
});

test("resize bursts are coalesced and cleanup prevents stale viewport updates", () => {
  const f = fixture();
  for (let i = 0; i < 10; i++) f.viewport.dispatchEvent(new Event("resize"));
  assert.equal(f.callbacks.size, 1);
  f.stop();
  f.viewport.dispatchEvent(new Event("resize"));
  f.browser.dispatchEvent(new Event("resize"));
  f.browser.document.dispatchEvent(new Event("visibilitychange"));
  f.mobile.dispatchEvent(new Event("change"));
  assert.equal(f.callbacks.size, 0);
  assert.equal(f.properties.size, 0);
});

test("browsers without VisualViewport use the window height", () => {
  const f = fixture(false);
  f.browser.innerHeight = 568;
  f.browser.dispatchEvent(new Event("resize"));
  f.flush();
  assert.equal(f.properties.get("--app-viewport-height"), "568px");
  assert.equal(f.properties.get("--app-viewport-top"), "0px");
  f.stop();
});
