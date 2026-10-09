"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Package, X } from "lucide-react";
import { markMyPackagesCollected } from "@/app/(coworker)/paquetes/actions";
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

export function CollectButton({
  packageIds,
  label,
  onDone,
  className = "",
}: {
  packageIds: string[];
  label: string;
  onDone?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { dict } = useI18n();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSaving(true);
    setError(null);
    const result = await markMyPackagesCollected(packageIds);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onDone?.();
    router.refresh();
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brown-dark py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        <Check className="h-4 w-4" strokeWidth={2.25} />
        {saving ? dict.packages.marking : label}
      </button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function PackageCard({ pkg }: PackageCardProps) {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const isPending = pkg.status === "pending";

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 text-left"
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
            {pkg.receivedByName && (
              <p className="text-xs text-warm-gray">{dict.packages.receivedBy(pkg.receivedByName)}</p>
            )}
            {pkg.status === "pending" ? (
              <p className="text-xs text-amber-700">{dict.packages.statusPending}</p>
            ) : (
              <p className="text-xs text-warm-gray">{dict.packages.statusCollected}</p>
            )}
          </div>
        </button>
        {isPending && (
          <CollectButton packageIds={[pkg.id]} label={dict.packages.markCollected} />
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center md:items-center md:p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-t-3xl md:rounded-3xl bg-white pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-xl">
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
                {pkg.receivedByName && (
                  <>
                    <span className="text-warm-gray">{dict.packages.receivedByLabel}</span>
                    <span className="text-ink">{pkg.receivedByName}</span>
                  </>
                )}
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
              {isPending && (
                <CollectButton
                  packageIds={[pkg.id]}
                  label={dict.packages.markCollected}
                  onDone={() => setOpen(false)}
                  className="mt-5"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
