"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, X } from "lucide-react";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";
import type { PackageItem } from "@/lib/data/packages";

interface PackageCardProps {
  pkg: PackageItem;
}

function formatWhen(iso: string, locale: Parameters<typeof formatDateLong>[1]) {
  const zoned = utcIsoToZonedDateAndMinutes(iso);
  return `${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/50">
          {pkg.imageUrl ? (
            <Image src={pkg.imageUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-warm-gray" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            {dict.packages.receivedAt} {formatWhen(pkg.receivedAt, locale)}
          </p>
          {pkg.status === "pending" ? (
            <p className="text-xs text-amber-700">{dict.packages.statusPending}</p>
          ) : (
            <p className="text-xs text-warm-gray">{dict.packages.statusCollected}</p>
          )}
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-t-3xl bg-white pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-xl">
            <div className="relative h-52 w-full bg-sand/50">
              {pkg.imageUrl && (
                <Image src={pkg.imageUrl} alt="" fill className="object-cover" unoptimized />
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
              >
                <X className="h-4 w-4 text-ink" strokeWidth={2} />
              </button>
              <span
                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  pkg.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-white/90 text-brown-dark"
                }`}
              >
                {pkg.status === "pending" ? dict.packages.statusPending : dict.packages.statusCollected}
              </span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <span className="text-warm-gray">{dict.packages.receivedAt}</span>
                <span className="text-ink">{formatWhen(pkg.receivedAt, locale)}</span>
                {pkg.collectedAt && (
                  <>
                    <span className="text-warm-gray">{dict.packages.collectedAt}</span>
                    <span className="text-ink">{formatWhen(pkg.collectedAt, locale)}</span>
                  </>
                )}
                {pkg.note && (
                  <>
                    <span className="text-warm-gray">{dict.packages.note}</span>
                    <span className="text-ink">{pkg.note}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
