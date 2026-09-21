"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  convertTime,
  effectiveOffset,
  formatIncrement,
  formatTime,
  formatOffset,
  getOption,
  nowTimeAtOffset,
  parseZoneParam,
  shiftHour,
  timeToMinutes,
  weekdayAtOffset,
} from "../lib/timezone";
import {
  DEFAULT_CLOCK,
  getClock,
  setClock,
  subscribeClock,
} from "../lib/format";
import ZoneStepper from "./ZoneStepper";
import SwapButton from "./SwapButton";
import CopyButton from "./CopyButton";
import TimeField from "./TimeField";
import { KIND_STYLE } from "./ConverterCard";
import { addRecent } from "../lib/recent";

const DEFAULT_FROM = "UTC";
const DEFAULT_TO = "EST-eastern";

export default function TimeZoneConverter({
  recordRecent = true,
}: {
  recordRecent?: boolean;
} = {}) {
  const searchParams = useSearchParams();

  const fromParam = parseZoneParam(searchParams.get("from"));
  const toParam = parseZoneParam(searchParams.get("to"));

  const [fromBase, setFromBase] = useState(() => fromParam?.key ?? DEFAULT_FROM);
  const [fromInc, setFromInc] = useState(() => fromParam?.increment ?? 0);
  const [toBase, setToBase] = useState(() => toParam?.key ?? DEFAULT_TO);
  const [toInc, setToInc] = useState(() => toParam?.increment ?? 0);

  const fromOffset = effectiveOffset(fromBase, fromInc);
  const toOffset = effectiveOffset(toBase, toInc);

  const fromLabel = `${getOption(fromBase)?.label ?? "UTC"} (UTC${formatOffset(fromOffset)})`;
  const toLabel = `${getOption(toBase)?.label ?? "UTC"} (UTC${formatOffset(toOffset)})`;

  // Time of day in the source zone: an explicit `?time=HH:MM`, else "now".
  const [timeStr, setTimeStr] = useState(() => {
    const t = searchParams.get("time");
    return t && timeToMinutes(t) !== null ? t : nowTimeAtOffset(fromOffset);
  });

  const result = convertTime(timeStr, fromOffset, toOffset);
  const clock = useSyncExternalStore(subscribeClock, getClock, () => DEFAULT_CLOCK);
  const outTime = result ? formatTime(result.time, clock) : "—";
  const dayDiff = result?.dayDiff ?? 0;
  const tz = KIND_STYLE.timezone;
  const toWeekday = result ? weekdayAtOffset(fromOffset, dayDiff) : "";

  const fromName = `${getOption(fromBase)?.label ?? "UTC"}${fromInc ? formatIncrement(fromInc) : ""}`;
  const toName = `${getOption(toBase)?.label ?? "UTC"}${toInc ? formatIncrement(toInc) : ""}`;

  // Record the timezone tool in the shared "recently used" list. The slug keeps
  // a stable `timezone` path (deduped to one card) while its query preserves the
  // current selection so the card links back to the same conversion.
  useEffect(() => {
    if (!recordRecent) return;
    const zoneParam = (base: string, inc: number) =>
      inc === 0 ? base : `${base}${inc > 0 ? `+${inc}` : inc}`;
    addRecent({
      slug: `timezone?from=${encodeURIComponent(
        zoneParam(fromBase, fromInc),
      )}&to=${encodeURIComponent(zoneParam(toBase, toInc))}`,
      fromLabel: fromName,
      toLabel: toName,
    });
  }, [recordRecent, fromBase, fromInc, toBase, toInc, fromName, toName]);

  const diffMin = toOffset - fromOffset;
  const diffAbs = Math.abs(diffMin);
  const diffHrs = `${Math.floor(diffAbs / 60)}${diffAbs % 60 ? `:${String(diffAbs % 60).padStart(2, "0")}` : ""}`;
  const diffUnit = diffHrs === "1" ? "hour" : "hours";
  const diffText =
    diffMin === 0
      ? `${fromName} is the same time as ${toName}`
      : `${fromName} is ${diffHrs} ${diffUnit} ${diffMin < 0 ? "ahead of" : "behind"} ${toName}`;

  function setNow() {
    setTimeStr(nowTimeAtOffset(fromOffset));
  }

  function handleSwap() {
    setFromBase(toBase);
    setFromInc(toInc);
    setToBase(fromBase);
    setToInc(fromInc);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
        <div className="flex flex-1 flex-col gap-1 text-sm font-medium">
          From
          <ZoneStepper
            label="From time zone"
            baseKey={fromBase}
            increment={fromInc}
            onBaseChange={(k) => {
              setFromBase(k);
              setFromInc(0);
            }}
            onIncrementChange={setFromInc}
          />
        </div>

        <div className="flex justify-center sm:pt-6">
          <SwapButton onClick={handleSwap} />
        </div>

        <div className="flex flex-1 flex-col gap-1 text-sm font-medium">
          To
          <ZoneStepper
            label="To time zone"
            baseKey={toBase}
            increment={toInc}
            onBaseChange={(k) => {
              setToBase(k);
              setToInc(0);
            }}
            onIncrementChange={setToInc}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 items-center gap-y-2 sm:grid-cols-3">
          <div
            className="col-start-1 row-start-1 flex items-center justify-self-start rounded-full border border-black/10 p-1 text-sm font-medium dark:border-white/15"
            role="group"
            aria-label="Clock format"
          >
            {(["24h", "12h"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={clock === mode}
                onClick={() => setClock(mode)}
                className={`flex h-9 items-center rounded-full px-3.5 transition-colors ${
                  clock === mode
                    ? "bg-black/[.08] dark:bg-white/[.14]"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="col-span-2 col-start-1 row-start-2 justify-self-center text-center text-sm font-semibold sm:col-span-1 sm:col-start-2 sm:row-start-1">
            Time in {fromName}
          </span>
          <button
            type="button"
            onClick={setNow}
            className="col-start-2 row-start-1 inline-flex h-11 items-center justify-self-end rounded-full border border-black/10 px-4 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06] sm:col-start-3"
          >
            Now
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Subtract one hour"
            onClick={() => setTimeStr((t) => shiftHour(t, -1))}
            className="flex h-12 shrink-0 items-center justify-center rounded-full border border-black/15 px-3 text-sm font-semibold leading-none transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
          >
            −1h
          </button>
          <TimeField
            ariaLabel={`Time in ${fromLabel}`}
            value={timeStr}
            onChange={setTimeStr}
            mode={clock}
            className="flex-1"
          />
          <button
            type="button"
            aria-label="Add one hour"
            onClick={() => setTimeStr((t) => shiftHour(t, 1))}
            className="flex h-12 shrink-0 items-center justify-center rounded-full border border-black/15 px-3 text-sm font-semibold leading-none transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
          >
            +1h
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {diffText}
      </p>

      <div
        className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg bg-black/[.04] p-4 pl-5 dark:bg-white/[.06]"
        aria-live="polite"
      >
        <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${tz.bar}`} />
        <div className="flex min-w-0 flex-col">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Time in {toName}
          </span>
          <output
            className={`flex items-baseline gap-2 text-4xl font-semibold tabular-nums ${tz.text}`}
          >
            {outTime}
            {dayDiff !== 0 && (
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {dayDiff > 0 ? `+${dayDiff}` : dayDiff} day
                {Math.abs(dayDiff) > 1 ? "s" : ""}
              </span>
            )}
          </output>
          {result && (
            <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {toWeekday} · UTC{formatOffset(toOffset)}
            </span>
          )}
        </div>
        <CopyButton value={outTime} label={`Copy time in ${toLabel}`} />
      </div>
    </div>
  );
}
