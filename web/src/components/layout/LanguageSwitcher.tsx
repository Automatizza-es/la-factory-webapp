"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { setLocale } from "@/lib/i18n/actions";
import { locales, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { useClickOutside } from "@/lib/use-click-outside";

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  async function handleSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    setPending(true);
    await setLocale(next);
    // router.refresh() doesn't reliably re-run the root layout's
    // cookies()-dependent render in every case; a full reload guarantees
    // the new locale cookie is picked up, and a language switch is rare
    // enough that losing SPA smoothness here doesn't matter.
    window.location.reload();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-sand/70 bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition-colors disabled:opacity-60"
      >
        <Globe className="h-4 w-4 text-brown-dark" strokeWidth={1.75} />
        {LOCALE_LABELS[locale].code}
        <ChevronDown className="h-3.5 w-3.5 text-warm-gray" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-44 overflow-hidden rounded-2xl bg-white py-1 shadow-lg ring-1 ring-sand/60"
        >
          {locales.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  code === locale
                    ? "bg-cream font-medium text-brown-dark"
                    : "text-ink hover:bg-cream/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  {code === locale ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <span className="w-3.5" />
                  )}
                  {LOCALE_LABELS[code].name}
                </span>
                <span className="text-xs text-warm-gray">{LOCALE_LABELS[code].code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
