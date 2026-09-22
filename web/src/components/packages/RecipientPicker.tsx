"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { PackageContactOption } from "@/lib/data/packages";

interface RecipientPickerProps {
  contacts: PackageContactOption[];
  value: string;
  onChange: (contactId: string) => void;
  label: string;
  searchPlaceholder: string;
  noResults: string;
}

export function RecipientPicker({
  contacts,
  value,
  onChange,
  label,
  searchPlaceholder,
  noResults,
}: RecipientPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [contacts, query]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-sand bg-white py-3 pl-9 pr-4 text-sm text-ink outline-none focus:border-brown-dark"
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-sand/60 bg-white">
        {filtered.length === 0 ? (
          <p className="p-3 text-sm text-warm-gray">{noResults}</p>
        ) : (
          filtered.map((c) => {
            const selected = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(c.id)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                  selected ? "bg-cream text-brown-dark" : "text-ink hover:bg-cream/60"
                }`}
              >
                {c.name}
                {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={2.25} />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
