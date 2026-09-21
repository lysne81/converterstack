"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type ComboOption = {
  id: string;
  /** Short form shown in bold on the trigger and right-aligned in the list. */
  symbol: string;
  label: string;
  /** Secondary line under the label in the list (category, format name, …). */
  meta?: string;
  /** Trigger secondary text when it should differ from the label. */
  detail?: string;
  /** Extra strings the search should match (aliases, alternate extensions). */
  keywords?: string[];
  /** Listed but not choosable — e.g. a format this browser cannot write. */
  disabled?: boolean;
  /** Shown next to a disabled option, e.g. "not supported in this browser". */
  disabledNote?: string;
};

function filterOptions(options: ComboOption[], query: string): ComboOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      o.symbol.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.keywords?.some((k) => k.toLowerCase().includes(q)),
  );
}

/** First selectable index from `start`, walking by `step`; -1 when there is none. */
function enabledIndex(
  list: ComboOption[],
  start: number,
  step: number,
): number {
  for (let i = start; i >= 0 && i < list.length; i += step) {
    if (!list[i].disabled) return i;
  }
  return -1;
}

export default function Combobox({
  value,
  options,
  onChange,
  label,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  searchLabel = "Search options",
  emptyLabel = "No matches",
  noneSelectableLabel = "None of these are available in this browser",
}: {
  value: string;
  options: ComboOption[];
  onChange: (id: string) => void;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  emptyLabel?: string;
  /** Shown when the filtered list has options but every one of them is disabled. */
  noneSelectableLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(
    () => filterOptions(options, query),
    [options, query],
  );

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

  // Reset highlight to the selected item (or top) when the list opens or filters.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function selectedIndexIn(list: ComboOption[]) {
    const i = list.findIndex((o) => o.id === value && !o.disabled);
    if (i >= 0) return i;
    return enabledIndex(list, 0, 1);
  }

  function openList() {
    setActiveIndex(selectedIndexIn(filtered));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(option: ComboOption) {
    if (option.disabled) return;
    onChange(option.id);
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
      case "ArrowDown": {
        e.preventDefault();
        const next = enabledIndex(filtered, activeIndex + 1, 1);
        if (next >= 0) setActiveIndex(next);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = enabledIndex(filtered, activeIndex - 1, -1);
        if (prev >= 0) setActiveIndex(prev);
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = enabledIndex(filtered, 0, 1);
        if (first >= 0) setActiveIndex(first);
        break;
      }
      case "End": {
        e.preventDefault();
        const last = enabledIndex(filtered, filtered.length - 1, -1);
        if (last >= 0) setActiveIndex(last);
        break;
      }
      case "Enter": {
        e.preventDefault();
        const option = filtered[activeIndex];
        if (option) pick(option);
        break;
      }
      case "Escape":
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
    }
  }

  const activeOption = activeIndex >= 0 ? filtered[activeIndex] : undefined;
  const noneSelectable = filtered.every((o) => o.disabled);
  const activeId =
    open && activeOption && !activeOption.disabled
      ? `${listId}-opt-${activeIndex}`
      : undefined;

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
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-black/15 bg-white px-3 text-base transition-colors hover:bg-black/[.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/20 dark:bg-zinc-950 dark:hover:bg-white/[.04]"
      >
        {selected ? (
          <>
            <span className="min-w-0 truncate font-semibold">
              {selected.symbol}
            </span>
            <span className="min-w-0 flex-1 truncate text-left text-sm text-zinc-500 dark:text-zinc-400">
              {selected.detail ?? selected.label}
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-left text-zinc-600 dark:text-zinc-400">
            {placeholder}
          </span>
        )}
        <span
          aria-hidden
          className="ml-auto text-xs text-zinc-500 dark:text-zinc-400"
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/15 dark:bg-zinc-900">
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={activeId}
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              setActiveIndex(enabledIndex(filterOptions(options, next), 0, 1));
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="h-10 w-full rounded-t-lg border-b border-black/10 bg-transparent px-3 text-sm outline-none dark:border-white/15"
          />
          {/* Kept outside the listbox: `option` is the only valid child role,
              and a live region lets a screen reader hear the empty state while
              the user keeps typing in the search box. */}
          <div role="status" aria-live="polite">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                {emptyLabel}
              </p>
            )}
            {filtered.length > 0 && noneSelectable && (
              <p className="px-3 pb-1 pt-2 text-xs text-zinc-600 dark:text-zinc-400">
                {noneSelectableLabel}
              </p>
            )}
          </div>
          <ul
            ref={listRef}
            role="listbox"
            id={listId}
            aria-label={label}
            className="max-h-60 overflow-auto py-1"
          >
            {filtered.map((option, index) => {
              const active = index === activeIndex;
              const disabled = option.disabled === true;
              return (
                // `option` may not contain interactive descendants, so the row
                // itself carries the pointer handlers and the inner element is
                // a plain div. `pick` ignores disabled options.
                <li
                  key={option.id}
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={option.id === value}
                  aria-disabled={disabled || undefined}
                  data-index={index}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(option)}
                  onMouseEnter={() => {
                    if (!disabled) setActiveIndex(index);
                  }}
                >
                  <div
                    className={`flex w-full select-none items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      active ? "bg-black/[.06] dark:bg-white/[.1]" : ""
                    } ${option.id === value && !disabled ? "font-semibold" : ""} ${
                      disabled
                        ? "cursor-not-allowed text-zinc-500 dark:text-zinc-400"
                        : "cursor-default"
                    }`}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.meta && (
                        <span className="truncate text-xs font-normal text-zinc-600 dark:text-zinc-400">
                          {option.meta}
                        </span>
                      )}
                      {disabled && option.disabledNote && (
                        <span className="truncate text-xs font-normal text-zinc-600 dark:text-zinc-400">
                          {option.disabledNote}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-zinc-600 dark:text-zinc-400">
                      {option.symbol}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
