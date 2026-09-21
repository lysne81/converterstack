"use client";

import {
  MAX_DECIMALS,
  MIN_DECIMALS,
} from "../lib/format";

export default function PrecisionControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (decimals: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm text-zinc-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 dark:text-zinc-400">
      <div className="flex items-center justify-between sm:justify-start">
        <span>Decimals</span>
        <span className="font-semibold tabular-nums text-zinc-900 sm:hidden dark:text-zinc-100">
          {value}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:flex-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(MIN_DECIMALS, value - 1))}
          disabled={value <= MIN_DECIMALS}
          aria-label="Decrease decimals"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xl shadow-sm transition-colors hover:bg-black/[.05] disabled:opacity-40 dark:border-white/15 dark:bg-zinc-800 dark:hover:bg-white/[.06]"
        >
          −
        </button>
        <input
          type="range"
          min={MIN_DECIMALS}
          max={MAX_DECIMALS}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 min-w-[8rem] flex-1 accent-current"
          aria-label={`Decimal places: ${value}`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_DECIMALS, value + 1))}
          disabled={value >= MAX_DECIMALS}
          aria-label="Increase decimals"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xl shadow-sm transition-colors hover:bg-black/[.05] disabled:opacity-40 dark:border-white/15 dark:bg-zinc-800 dark:hover:bg-white/[.06]"
        >
          +
        </button>
      </div>

      <span className="hidden w-5 shrink-0 text-center font-medium tabular-nums sm:block">
        {value}
      </span>
    </div>
  );
}
