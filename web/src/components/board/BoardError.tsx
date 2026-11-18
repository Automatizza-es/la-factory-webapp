"use client";

import { getBoardDictionary } from "@/lib/board";
import { useI18n } from "@/lib/i18n/context";

export function BoardError({ reset }: { reset: () => void }) {
  const { locale } = useI18n();
  const t = getBoardDictionary(locale);
  return (
    <div role="alert" className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <p>{t.loadError}</p>
      <button onClick={reset} className="self-start rounded-xl bg-brown-dark px-5 py-3 text-sm text-white">{t.back}</button>
    </div>
  );
}
