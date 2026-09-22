import Link from "next/link";
import { Plus } from "lucide-react";
import { PackageCard } from "@/components/packages/PackageCard";
import { getCurrentCoworker } from "@/lib/data/coworker";
import { getMyPackages } from "@/lib/data/packages";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function PaquetesPage() {
  const current = await getCurrentCoworker();
  if (!current) return null;

  const dict = getDictionary(await getLocale());
  const supabase = await createClient();
  const packages = await getMyPackages(supabase, current.contactId);

  const pending = packages.filter((p) => p.status === "pending");
  const history = packages.filter((p) => p.status === "collected");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{dict.packages.title}</h1>
          <p className="text-sm text-warm-gray">{dict.packages.subtitle}</p>
        </div>
        <Link
          href="/paquetes/nuevo"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brown-dark px-3.5 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {dict.admin.packages.newPackage}
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{dict.packages.pending}</h2>
        <div className="flex flex-col gap-3">
          {pending.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.packages.noPending}
            </p>
          ) : (
            pending.map((p) => <PackageCard key={p.id} pkg={p} />)
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{dict.packages.history}</h2>
        <div className="flex flex-col gap-3">
          {history.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-warm-gray shadow-sm">
              {dict.packages.noHistory}
            </p>
          ) : (
            history.map((p) => <PackageCard key={p.id} pkg={p} />)
          )}
        </div>
      </section>
    </div>
  );
}
