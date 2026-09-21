"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ZONE_OPTIONS, currentOffsetForKey, formatOffset, isDstActive } from "../lib/timezone";

/**
 * Compact, searchable dropdown of zone options — base abbreviations (UTC, GMT,
 * EST, …) and major cities. The trigger shows only the selected label; the
 * popup lets the user type to filter by abbreviation, city, or country and
 * shows the fixed UTC offset as a hint. Picking a city selects its offset.
 */
export default function BaseCombobox({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (key: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = ZONE_OPTIONS.find((o) => o.key === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ZONE_OPTIONS;
    return ZONE_OPTIONS.filter(
      (o) =>
        o.key.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q) ||
        (o.sub?.toLowerCase().includes(q) ?? false),
    );
  }, [query]);

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
    const i = filtered.findIndex((o) => o.key === value);
    setActiveIndex(i >= 0 ? i : 0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(key: string) {
    onChange(key);
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
        if (filtered[activeIndex]) pick(filtered[activeIndex].key);
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
        className="flex h-8 max-w-[9rem] items-center gap-1 rounded-md px-2 text-base font-semibold transition-colors hover:bg-black/[.06] focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/[.1]"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <span aria-hidden className="text-xs text-zinc-400">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/15 dark:bg-zinc-900">
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
            placeholder="Search zone or city…"
            aria-label="Search time zones and cities"
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
            {filtered.map((o, index) => {
              const active = index === activeIndex;
              const optOffset = currentOffsetForKey(o.key);
              const optDst = isDstActive(o.key);
              return (
                <li
                  key={o.key}
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={o.key === value}
                  data-index={index}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => pick(o.key)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      active ? "bg-black/[.06] dark:bg-white/[.1]" : ""
                    } ${o.key === value ? "font-semibold" : ""}`}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{o.label}</span>
                      {o.sub && (
                        <span className="truncate text-xs font-normal text-zinc-400">
                          {o.sub}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-400 tabular-nums">
                      UTC{formatOffset(optOffset)}
                      {optDst && (
                        <span className="rounded-full bg-amber-500/15 px-1 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          DST
                        </span>
                      )}
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
