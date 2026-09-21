"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {Currency} from "@/app/lib/currency";

/**
 * Compact, searchable currency picker. The trigger shows the selected code; the
 * popup lets the user type to filter by code or name and shows the currency
 * symbol as a hint. Modeled on BaseCombobox for a consistent feel.
 */
export default function CurrencyCombobox({
    currencies,
  value,
  onChange,
  label,
}: {
  currencies: readonly Currency[]
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = currencies.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [currencies, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function openList() {
    const i = filtered.findIndex((c) => c.code === value);
    setActiveIndex(i >= 0 ? i : 0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(code: string) {
    onChange(code);
    close();
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(filtered.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[activeIndex]) pick(filtered[activeIndex].code);
        break;
      case "Escape":
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
    }
  }

  const activeId =
    open && filtered[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-black/15 bg-white px-3 text-base transition-colors hover:bg-black/[.02] focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/20 dark:bg-zinc-950 dark:hover:bg-white/[.04]"
      >
        <span className="font-semibold">{selected?.code ?? value}</span>
        <span className="min-w-0 flex-1 truncate text-left text-sm text-zinc-500 dark:text-zinc-400">
          {selected?.name}
        </span>
        <span aria-hidden className="text-xs text-zinc-400">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-64 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/15 dark:bg-zinc-900">
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search currency…"
            aria-label="Search currencies"
            className="h-10 w-full rounded-t-lg border-b border-black/10 bg-transparent px-3 text-sm outline-none dark:border-white/15"
          />
          <ul
            ref={listRef}
            role="listbox"
            id={listId}
            className="max-h-60 overflow-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-zinc-500">No matches</li>
            )}
            {filtered.map((c, index) => {
              const active = index === activeIndex;
              return (
                <li
                  key={c.code}
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={c.code === value}
                  data-index={index}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => pick(c.code)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      active ? "bg-black/[.06] dark:bg-white/[.1]" : ""
                    } ${c.code === value ? "font-semibold" : ""}`}
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="w-10 shrink-0 font-semibold tabular-nums">
                        {c.code}
                      </span>
                      <span className="truncate font-normal text-zinc-500 dark:text-zinc-400">
                        {c.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-zinc-400">
                      {c.symbol}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
