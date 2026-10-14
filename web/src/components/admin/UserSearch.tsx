"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface UserSearchProps {
  // Current list filter ("todos" = none), kept in the URL alongside the search.
  filter: string;
  initialQuery: string;
  placeholder: string;
  label: string;
}

// Searches as you type and keeps the URL in step with the box, so clearing
// it and refreshing doesn't bring the old word back.
export function UserSearch({ filter, initialQuery, placeholder, label }: UserSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const lastPushed = useRef(initialQuery);

  function apply(text: string) {
    const q = text.trim();
    if (q === lastPushed.current) return;
    lastPushed.current = q;
    const params = new URLSearchParams();
    if (filter !== "todos") params.set("filtro", filter);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.replace(`/admin/coworkers${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  useEffect(() => {
    const timer = setTimeout(() => apply(value), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply(value);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2 md:w-72">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" strokeWidth={2} />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="w-full rounded-xl border border-sand bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-brown-dark"
        />
      </div>
    </form>
  );
}
