"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { formatDatePill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

interface DatePillProps {
  date: string;
  locale: Locale;
  extraQuery: string;
  label?: string;
}

export function DatePill({ date, locale, extraQuery, label }: DatePillProps) {
  const router = useRouter();

  return (
    <label className="relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-full bg-white px-2.5 py-2 shadow-sm">
      <Calendar className="h-4 w-4 shrink-0 text-brown-dark" strokeWidth={2} />
      <span className="truncate whitespace-nowrap text-sm font-medium text-ink">
        {label ?? formatDatePill(date, locale)}
      </span>
      <input
        type="date"
        value={date}
        onChange={(event) => {
          if (event.target.value) {
            router.push(`/calendario?fecha=${event.target.value}${extraQuery}`);
          }
        }}
        aria-label="Elegir fecha"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}
