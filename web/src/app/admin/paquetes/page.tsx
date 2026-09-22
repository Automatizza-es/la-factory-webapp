import Image from "next/image";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { MarkCollectedButton } from "@/components/admin/MarkCollectedButton";
import { getAdminPackages, type PackageFilter } from "@/lib/data/packages";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedDateAndMinutes } from "@/lib/timezone";

interface AdminPackagesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

function formatWhen(iso: string, locale: Awaited<ReturnType<typeof getLocale>>) {
  const zoned = utcIsoToZonedDateAndMinutes(iso);
  return `${formatDateLong(zoned.date, locale)} · ${minutesToTime(zoned.minutes)}`;
}

export default async function AdminPackagesPage({ searchParams }: AdminPackagesPageProps) {
  const { filter } = await searchParams;
  const activeFilter: PackageFilter =
    filter === "collected" || filter === "all" ? filter : "pending";

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const packages = await getAdminPackages(supabase, activeFilter);

  const filters: { key: PackageFilter; label: string }[] = [
    { key: "pending", label: dict.admin.packages.filterPending },
    { key: "collected", label: dict.admin.packages.filterCollected },
    { key: "all", label: dict.admin.packages.filterAll },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.admin.packages.title}</h1>
          <p className="text-sm text-warm-gray">{dict.admin.packages.subtitle}</p>
        </div>
        <Link
          href="/admin/paquetes/new"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {dict.admin.packages.newPackage}
        </Link>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/paquetes?filter=${f.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              activeFilter === f.key ? "bg-brown-dark text-white" : "bg-white text-warm-gray shadow-sm"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {packages.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
          {dict.admin.packages.noPackages}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {packages.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/50">
                {p.imageUrl && (
                  <Image src={p.imageUrl} alt="" fill className="object-cover" unoptimized />
                )}
                {!p.imageUrl && (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-5 w-5 text-warm-gray" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{p.recipientName}</p>
                <p className="text-xs text-warm-gray">
                  {dict.admin.packages.receivedAt}: {formatWhen(p.receivedAt, locale)}
                </p>
                {p.status === "collected" && p.collectedAt && (
                  <p className="text-xs text-warm-gray">
                    {dict.admin.packages.collectedAtLabel}: {formatWhen(p.collectedAt, locale)}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  p.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-sand/50 text-brown-dark"
                }`}
              >
                {p.status === "pending"
                  ? dict.admin.packages.statusPending
                  : dict.admin.packages.statusCollected}
              </span>
              {p.status === "pending" && (
                <MarkCollectedButton packageId={p.id} label={dict.admin.packages.markCollected} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
