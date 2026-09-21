"use client";

import {
  effectiveOffset,
  formatIncrement,
  formatOffset,
  isDstActive,
  MAX_OFFSET,
  MIN_OFFSET,
} from "../lib/timezone";
import BaseCombobox from "./BaseCombobox";

/**
 * Time-zone picker for the fixed-offset model. A base abbreviation is chosen
 * from a dropdown (UTC, GMT, EST, CET, …) and a whole-hour incrementor is
 * layered on top, rendered as `[Base ▾] [+] <increment> [−]`. The effective
 * offset and a representative city are shown below.
 */
export default function ZoneStepper({
  baseKey,
  increment,
  onBaseChange,
  onIncrementChange,
  label,
}: {
  baseKey: string;
  increment: number;
  onBaseChange: (key: string) => void;
  onIncrementChange: (increment: number) => void;
  label: string;
}) {
  const offset = effectiveOffset(baseKey, increment);
  const dst = isDstActive(baseKey);

  const atMax = offset + 60 > MAX_OFFSET;
  const atMin = offset - 60 < MIN_OFFSET;

  const stepBtn =
    "grid h-10 w-10 place-items-center text-lg leading-none text-zinc-500 transition-colors hover:bg-black/[.05] hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-100";

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex h-11 items-center gap-2 rounded-lg border border-black/15 bg-white px-2 dark:border-white/20 dark:bg-zinc-950"
        role="group"
        aria-label={label}
      >
        <BaseCombobox
          label={`${label}: base zone`}
          value={baseKey}
          onChange={onBaseChange}
        />
        <div className="ml-auto flex items-center rounded-full border border-black/10 dark:border-white/15">
          <button
            type="button"
            aria-label={`${label}: increment offset`}
            onClick={() => onIncrementChange(increment + 1)}
            disabled={atMax}
            className={`${stepBtn} rounded-l-full`}
          >
            +
          </button>
          <span
            className="grid h-10 min-w-[2.75rem] place-items-center border-x border-black/10 px-1 text-sm font-semibold tabular-nums dark:border-white/15"
            aria-live="polite"
          >
            {formatIncrement(increment)}
          </span>
          <button
            type="button"
            aria-label={`${label}: decrement offset`}
            onClick={() => onIncrementChange(increment - 1)}
            disabled={atMin}
            className={`${stepBtn} rounded-r-full`}
          >
            −
          </button>
        </div>
      </div>
      <span className="flex flex-wrap items-center gap-1.5 pl-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          UTC{formatOffset(offset)}
        </span>
        {dst && (
          <span className="rounded-full bg-amber-500/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            DST
          </span>
        )}
      </span>
    </div>
  );
}
