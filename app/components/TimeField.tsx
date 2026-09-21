"use client";

import { useEffect, useRef, useState } from "react";
import { minutesToTime, timeToMinutes } from "../lib/timezone";

type Props = {
  /** Canonical 24h value, "HH:MM". */
  value: string;
  onChange: (value: string) => void;
  /** Display style for the segments. */
  mode: "24h" | "12h";
  ariaLabel: string;
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

type Period = "AM" | "PM";

function decompose(value: string, mode: "24h" | "12h") {
  const mins = timeToMinutes(value) ?? 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return {
    hour: mode === "12h" ? String(h % 12 || 12) : pad(h),
    minute: pad(m),
    period: (h < 12 ? "AM" : "PM") as Period,
  };
}

export default function TimeField({
  value,
  onChange,
  mode,
  ariaLabel,
  className = "",
}: Props) {
  const is12 = mode === "12h";
  const initial = decompose(value, mode);

  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<Period>(initial.period);

  // Tracks the canonical value we last emitted so parent echoes don't clobber
  // in-progress typing (only genuine external changes trigger a resync).
  const emitted = useRef(value);
  const minuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value === emitted.current) return;
    const d = decompose(value, mode);
    setHour(d.hour);
    setMinute(d.minute);
    setPeriod(d.period);
    emitted.current = value;
  }, [value, mode]);

  // Re-render the segments when the display style changes.
  useEffect(() => {
    const d = decompose(emitted.current, mode);
    setHour(d.hour);
    setMinute(d.minute);
    setPeriod(d.period);
  }, [mode]);

  function emit(h: string, m: string, p: Period) {
    let hh = Number(h);
    let mm = Number(m);
    if (!Number.isFinite(hh)) hh = 0;
    if (!Number.isFinite(mm)) mm = 0;
    mm = Math.min(59, Math.max(0, mm));
    if (is12) {
      const base = (Math.min(12, Math.max(1, hh || 12)) % 12);
      hh = p === "PM" ? base + 12 : base;
    } else {
      hh = Math.min(23, Math.max(0, hh));
    }
    const next = `${pad(hh)}:${pad(mm)}`;
    emitted.current = next;
    onChange(next);
  }

  function onHourChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setHour(digits);
    if (digits === "") return;
    emit(digits, minute, period);
    const num = Number(digits);
    if (digits.length === 2 || (is12 ? num > 1 : num > 2)) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  }

  function onMinuteChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setMinute(digits);
    if (digits !== "") emit(hour, digits, period);
  }

  function normalize() {
    const d = decompose(emitted.current, mode);
    setHour(d.hour);
    setMinute(d.minute);
    setPeriod(d.period);
  }

  function bump(segment: "h" | "m", delta: number) {
    const mins = timeToMinutes(emitted.current) ?? 0;
    const next = minutesToTime(mins + delta * (segment === "h" ? 60 : 1));
    const d = decompose(next, mode);
    setHour(d.hour);
    setMinute(d.minute);
    setPeriod(d.period);
    emitted.current = next;
    onChange(next);
  }

  function onSegmentKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    segment: "h" | "m",
  ) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      bump(segment, e.key === "ArrowUp" ? 1 : -1);
    }
  }

  function togglePeriod() {
    const next: Period = period === "AM" ? "PM" : "AM";
    setPeriod(next);
    emit(hour, minute, next);
  }

  const segmentClass =
    "w-8 bg-transparent text-center outline-none tabular-nums";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex h-12 min-w-0 items-center justify-center gap-0.5 rounded-lg border border-black/15 bg-white px-3 text-lg tabular-nums focus-within:border-black/40 dark:border-white/20 dark:bg-zinc-950 dark:focus-within:border-white/50 ${className}`}
    >
      <input
        aria-label="Hours"
        inputMode="numeric"
        value={hour}
        onChange={(e) => onHourChange(e.target.value)}
        onKeyDown={(e) => onSegmentKey(e, "h")}
        onFocus={(e) => e.target.select()}
        onBlur={normalize}
        className={segmentClass}
      />
      <span aria-hidden className="select-none">
        :
      </span>
      <input
        ref={minuteRef}
        aria-label="Minutes"
        inputMode="numeric"
        value={minute}
        onChange={(e) => onMinuteChange(e.target.value)}
        onKeyDown={(e) => onSegmentKey(e, "m")}
        onFocus={(e) => e.target.select()}
        onBlur={normalize}
        className={segmentClass}
      />
      {is12 && (
        <button
          type="button"
          onClick={togglePeriod}
          aria-label={`Toggle AM/PM, currently ${period}`}
          className="ml-1 flex h-9 items-center rounded-md bg-black/[.05] px-2.5 text-sm font-medium transition-colors hover:bg-black/[.1] dark:bg-white/[.08] dark:hover:bg-white/[.14]"
        >
          {period}
        </button>
      )}
    </div>
  );
}
