"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

interface ContactOption {
  id: string;
  name: string;
}

interface AudienceContactPickerProps {
  contacts: ContactOption[];
  value: string[];
  onChange: (contactIds: string[]) => void;
  searchPlaceholder: string;
}

export function AudienceContactPicker({
  contacts,
  value,
  onChange,
  searchPlaceholder,
}: AudienceContactPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [contacts, query]);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-1.5">
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
        {filtered.map((c) => {
          const selected = value.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                selected ? "bg-cream text-brown-dark" : "text-ink hover:bg-cream/60"
              }`}
            >
              {c.name}
              {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={2.25} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
