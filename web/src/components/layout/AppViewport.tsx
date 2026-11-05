"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { observeMobileViewport } from "@/lib/mobile-viewport";

// On phones, scrolling belongs to the content pane. The tab bar occupies
// its own row instead of following iOS's fixed-bottom viewport heuristics.
export function AppViewport({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    return observeMobileViewport(frame, window);
  }, []);

  useEffect(() => {
    const content = frameRef.current?.querySelector<HTMLElement>("[data-app-scroll]");
    if (content) content.scrollTop = 0;
  }, [pathname]);

  return <div ref={frameRef} data-app-viewport className="app-viewport md:pl-60">{children}</div>;
}
