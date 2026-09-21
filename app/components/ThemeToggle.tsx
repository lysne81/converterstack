"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  applyTheme,
  getStoredTheme,
  subscribeTheme,
  type Theme,
} from "../lib/theme";

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "system", label: "System", icon: "🖥️" },
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
];

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => "system" as Theme,
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(getStoredTheme());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const activeOption = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];

  return (
    <div ref={containerRef} className="relative">
      {/* Inline segmented control — shown when there is room */}
      <div
        role="group"
        aria-label="Theme"
        className="hidden items-center gap-1 rounded-full border border-black/10 p-1 min-[420px]:inline-flex dark:border-white/15"
      >
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-label={`${opt.label} theme`}
              aria-pressed={active}
              onClick={() => applyTheme(opt.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                active
                  ? "bg-black/[.08] dark:bg-white/[.15]"
                  : "hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              }`}
            >
              <span aria-hidden>{opt.icon}</span>
            </button>
          );
        })}
      </div>

      {/* Single current-mode icon — shown on narrow screens */}
      <button
        type="button"
        aria-label={`Theme: ${activeOption.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-black/[.04] min-[420px]:hidden dark:border-white/15 dark:hover:bg-white/[.08]"
      >
        <span aria-hidden className="text-lg leading-none">
          {activeOption.icon}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 top-12 z-30 flex w-40 flex-col rounded-lg border border-black/10 bg-white p-1 shadow-lg min-[420px]:hidden dark:border-white/15 dark:bg-zinc-900"
        >
          {OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  applyTheme(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-black/[.06] dark:bg-white/[.1]"
                    : "hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                }`}
              >
                <span aria-hidden>{opt.icon}</span>
                {opt.label}
                {active && <span className="ml-auto text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <span className="sr-only">Current theme: {activeOption.label}</span>
    </div>
  );
}
