"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type DefinitionSearchItem = {
  id: string;
  href: string;
  name: string;
  symbol: string;
  /** Optional one-line summary shown under the name/symbol. */
  description?: string;
};

export type DefinitionSearchGroup = {
  /** Stable key for the group, e.g. a unit category or a kind name. */
  key: string;
  label: string;
  items: readonly DefinitionSearchItem[];
};

/**
 * Generic grouped search used across the definitions system: the unified
 * `/definitions` landing page groups results by kind (units, time zones, and
 * any future kind), while `/definitions/units` groups results by unit
 * category. Callers own how items are grouped and labeled.
 */
export default function DefinitionsSearch({
  groups,
  inputLabel = "Search definitions",
  placeholder = "Search definitions (e.g. meter, kg, m²)",
  emptyLabel = "definitions",
}: {
  groups: readonly DefinitionSearchGroup[];
  inputLabel?: string;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [item.name, item.symbol, item.id, item.description, group.label]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, normalizedQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <label htmlFor="definition-search" className="sr-only">
          {inputLabel}
        </label>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="definition-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-black/15 bg-white pl-12 pr-4 text-base shadow-sm transition-shadow focus:border-blue-500/60 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/20 dark:bg-zinc-950 dark:focus:border-blue-400/60 dark:focus:ring-blue-400/25"
        />
      </div>

      {filteredGroups.length > 0 ? (
        filteredGroups.map(({ key, label, items }) => (
          <section key={key} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-900"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {item.symbol}
                    </span>
                    {item.description && (
                      <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                        {item.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p
          className="rounded-2xl bg-white p-6 text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400"
          role="status"
        >
          No {emptyLabel} match “{query}”.
        </p>
      )}
    </div>
  );
}
