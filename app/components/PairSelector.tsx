"use client";

import {useEffect, useMemo, useState, useSyncExternalStore} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {convert, getConversionPairs, parseSlug, slugFor, UNITS} from "../lib/units";
import {DEFAULT_DECIMALS, formatNumber, getDecimals, setDecimals, subscribeDecimals,} from "../lib/format";
import {addRecent, getRecent} from "../lib/recent";
import UnitCombobox from "./UnitCombobox";
import SwapButton from "./SwapButton";
import CopyButton from "./CopyButton";
import PrecisionControl from "./PrecisionControl";
import { KIND_STYLE } from "./ConverterCard";

export default function PairSelector({
  initialFromId,
  initialToId,
  recordRecent = false,
  lockUnits = false,
}: {
  initialFromId?: string;
  initialToId?: string;
  recordRecent?: boolean;
  showOpenLink?: boolean;
  lockUnits?: boolean;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pairs = useMemo(() => getConversionPairs(), []);
  const decimals = useSyncExternalStore(
    subscribeDecimals,
    getDecimals,
    () => DEFAULT_DECIMALS,
  );

  const startFrom = initialFromId ?? UNITS[0].id;

  // On the front page (no explicit initial units), start from the last used
  // converter. Reads localStorage lazily — matches the `searchParams` prefill
  // pattern and stays empty during static prerender.
  const recentPair =
    initialFromId || initialToId
      ? null
      : (() => {
          const last = getRecent()[0];
          return last ? parseSlug(last.slug) : null;
        })();

  const initialFrom = initialFromId ?? recentPair?.from.id ?? startFrom;
  const [fromId, setFromId] = useState<string>(initialFrom);
  const [raw, setRaw] = useState<string>(() => searchParams.get("value") ?? "1");

  const compatibleTargets = useMemo(
    () => pairs.filter((p) => p.from.id === fromId).map((p) => p.to),
    [pairs, fromId],
  );

  const [toId, setToId] = useState<string>(
    initialToId ??
      recentPair?.to.id ??
      pairs.find((p) => p.from.id === initialFrom)?.to.id ??
      "",
  );

  const from = UNITS.find((u) => u.id === fromId)!;
  const to = UNITS.find((u) => u.id === toId)!;

  useEffect(() => {
    if (!recordRecent || !from || !to) return;
    addRecent({
      slug: slugFor(from, to),
      fromLabel: from.label,
      toLabel: to.label,
    });
  }, [recordRecent, from, to]);

  const parsed = Number.parseFloat(raw);
  const hasValue = raw.trim() !== "" && Number.isFinite(parsed);
  const resultValue = hasValue
    ? formatNumber(convert(parsed, from, to), decimals)
    : "";

  function handleFromChange(nextFrom: string) {
    setFromId(nextFrom);
    if (!pairs.some((p) => p.from.id === nextFrom && p.to.id === toId)) {
      setToId(pairs.find((p) => p.from.id === nextFrom)?.to.id ?? "");
    }
  }

  function handleSwap() {
    if (!pairs.some((p) => p.from.id === toId && p.to.id === fromId)) return;
    if (lockUnits) {
      router.push(`/${slugFor(to, from)}`);
      return;
    }
    setFromId(toId);
    setToId(fromId);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          From
          {lockUnits ? (
            <div className="flex h-11 items-center rounded-lg border border-black/10 bg-black/[.03] px-3 text-base dark:border-white/15 dark:bg-white/[.04]">
              {from.label} ({from.symbol})
            </div>
          ) : (
            <UnitCombobox
              label="From unit"
              value={fromId}
              options={UNITS}
              onChange={handleFromChange}
            />
          )}
        </label>

        <div className="flex justify-center sm:pb-1">
          <SwapButton onClick={handleSwap} />
        </div>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          To
          {lockUnits ? (
            <div className="flex h-11 items-center rounded-lg border border-black/10 bg-black/[.03] px-3 text-base dark:border-white/15 dark:bg-white/[.04]">
              {to.label} ({to.symbol})
            </div>
          ) : (
            <UnitCombobox
              label="To unit"
              value={toId}
              options={compatibleTargets}
              onChange={setToId}
            />
          )}
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="converter-value" className="text-sm font-semibold">
          Value in {from.label}
        </label>
        <div className="relative">
          <input
            id="converter-value"
            type="number"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={`Value in ${from.label} (${from.symbol})`}
            className="h-12 w-full rounded-lg border border-black/15 bg-white pl-4 pr-16 text-lg tabular-nums dark:border-white/20 dark:bg-zinc-950"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg font-medium text-zinc-500 dark:text-zinc-400"
          >
            {from.symbol}
          </span>
        </div>
      </div>

      <div
        className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg bg-black/[.04] p-4 pl-5 dark:bg-white/[.06]"
        aria-live="polite"
      >
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-1 ${KIND_STYLE[to.category].bar}`}
        />
        <div className="flex min-w-0 flex-col">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {to.label} ({to.symbol})
          </span>
          <output
            className={`break-all text-3xl font-semibold tabular-nums ${
              hasValue ? KIND_STYLE[to.category].text : ""
            }`}
          >
            {hasValue ? resultValue : "—"}
          </output>
        </div>
        <CopyButton value={resultValue} label={`Copy ${to.label} value`} />
      </div>

      <PrecisionControl value={decimals} onChange={setDecimals} />
    </div>
  );
}
