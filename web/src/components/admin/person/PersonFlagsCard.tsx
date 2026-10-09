"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setArchived, updatePerson } from "@/app/admin/coworkers/[id]/actions";
import { Switch } from "@/components/admin/person/Switch";
import { useI18n } from "@/lib/i18n/context";

// Archived / can receive packages / newsletter: each saves on toggle.
export function PersonFlagsCard({
  contactId,
  archived,
  canReceivePackages,
  newsletter,
}: {
  contactId: string;
  archived: boolean;
  canReceivePackages: boolean;
  newsletter: boolean;
}) {
  const t = useI18n().dict.admin.userDetail;
  const router = useRouter();
  const [state, setState] = useState({ archived, canReceivePackages, newsletter });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: keyof typeof state, value: boolean) {
    setBusy(true);
    setError(null);
    const result =
      key === "archived"
        ? await setArchived(contactId, value)
        : await updatePerson(
            contactId,
            key === "canReceivePackages" ? { can_receive_packages: value } : { marketing_consent: value },
          );
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setState((s) => ({ ...s, [key]: value }));
    router.refresh();
  }

  const rows: { key: keyof typeof state; label: string; hint?: string }[] = [
    { key: "canReceivePackages", label: t.canReceivePackages },
    { key: "newsletter", label: t.newsletter },
    { key: "archived", label: t.archived, hint: t.archivedHint },
  ];

  return (
    <section className="flex flex-col gap-1 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="mb-2 font-semibold text-ink">{t.sectionStatus}</h2>
      {rows.map((row) => (
        <div key={row.key} className="flex items-start justify-between gap-4 border-b border-sand/30 py-3 last:border-0">
          <div>
            <p className="text-sm text-ink">{row.label}</p>
            {row.hint && <p className="mt-0.5 text-xs text-warm-gray">{row.hint}</p>}
          </div>
          <Switch
            checked={state[row.key]}
            disabled={busy}
            label={row.label}
            onChange={(value) => toggle(row.key, value)}
          />
        </div>
      ))}
      {error && <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
