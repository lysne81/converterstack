"use client";

import {useEffect, useState, useSyncExternalStore} from "react";
import {useSearchParams} from "next/navigation";
import {
    DEFAULT_FROM,
    DEFAULT_TO,
    convert,
    formatRateDate,
    getRates,
    isCurrencyCode,
    type Currency,
    type Rates,
} from "../lib/currency";
import {
    DEFAULT_DECIMALS,
    formatNumber,
    getDecimals,
    setDecimals,
    subscribeDecimals,
} from "../lib/format";
import {addRecent} from "../lib/recent";
import {useCurrencies} from "../lib/useCurrencies";
import CurrencyCombobox from "./CurrencyCombobox";
import SwapButton from "./SwapButton";
import CopyButton from "./CopyButton";
import PrecisionControl from "./PrecisionControl";
import {KIND_STYLE} from "./ConverterCard";

type Status = "loading" | "ready" | "error";

/** Placeholder used until the fetched currency list resolves. */
const placeholder = (code: string): Currency => ({
    code,
    name: code,
    symbol: code,
    type: "fiat",
    countries: [],
});

export default function CurrencyConverter({
                                              recordRecent = true,
                                          }: {
    recordRecent?: boolean;
} = {}) {
    const searchParams = useSearchParams();

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const amountParam = searchParams.get("amount");

    const [fromCode, setFromCode] = useState(() =>
        isCurrencyCode(fromParam) ? fromParam.toUpperCase() : DEFAULT_FROM,
    );
    const [toCode, setToCode] = useState(() =>
        isCurrencyCode(toParam) ? toParam.toUpperCase() : DEFAULT_TO,
    );
    const [raw, setRaw] = useState(() =>
        amountParam && Number.isFinite(Number(amountParam)) ? amountParam : "1",
    );

    // Rates are fetched lazily and reused for the lifetime of the page.
    const [rates, setRates] = useState<Rates | null>(null);
    const [status, setStatus] = useState<Status>("loading");

    const currencies = useCurrencies()

    useEffect(() => {
        let cancelled = false;
        getRates()
            .then((data) => {
                if (cancelled) return;
                setRates(data);
                setStatus("ready");
            })
            .catch(() => {
                if (cancelled) return;
                setStatus("error");
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const decimals = useSyncExternalStore(
        subscribeDecimals,
        getDecimals,
        () => DEFAULT_DECIMALS,
    );

    const from = currencies.find((c) => c.code === fromCode) ?? placeholder(fromCode);
    const to = currencies.find((c) => c.code === toCode) ?? placeholder(toCode);
    const theme = KIND_STYLE.currency;

    // Record the currency tool in the shared "recently used" list. Stable
    // `currency` path (deduped to one card); query preserves the selection.
    useEffect(() => {
        if (!recordRecent) return;
        addRecent({
            slug: `exchangerate?from=${fromCode}&to=${toCode}`,
            fromLabel: fromCode,
            toLabel: toCode,
        });
    }, [recordRecent, fromCode, toCode]);

    const parsed = Number.parseFloat(raw);
    const hasAmount = raw.trim() !== "" && Number.isFinite(parsed);
    const rateMap = rates?.rates;

    const converted =
        hasAmount && rateMap ? convert(parsed, fromCode, toCode, rateMap) : NaN;
    const resultValue = Number.isFinite(converted)
        ? formatNumber(converted, decimals)
        : "";

    // Unit-rate line: 1 FROM = X TO.
    const unitRate = rateMap ? convert(1, fromCode, toCode, rateMap) : NaN;
    const unitRateText = Number.isFinite(unitRate)
        ? `1 ${fromCode} = ${formatNumber(unitRate, Math.max(decimals, 4))} ${toCode}`
        : "";

    function handleSwap() {
        setFromCode(toCode);
        setToCode(fromCode);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
                    From
                    <CurrencyCombobox
                        currencies={currencies}
                        label="From currency"
                        value={fromCode}
                        onChange={setFromCode}
                    />
                </label>

                <div className="flex justify-center sm:pb-1">
                    <SwapButton onClick={handleSwap}/>
                </div>

                <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
                    To
                    <CurrencyCombobox
                        currencies={currencies}
                        label="To currency"
                        value={toCode}
                        onChange={setToCode}
                    />
                </label>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="currency-amount" className="text-sm font-semibold">
                    Amount in {from.name}
                </label>
                <div className="relative">
                    <input
                        id="currency-amount"
                        type="number"
                        inputMode="decimal"
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        placeholder={`Amount in ${fromCode}`}
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
                <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${theme.bar}`}/>
                <div className="flex min-w-0 flex-col">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {to.name} ({to.code})
          </span>
                    {status === "error" ? (
                        <span className="text-base font-medium text-red-600 dark:text-red-400">
              Couldn’t load exchange rates. Check your connection and refresh.
            </span>
                    ) : (
                        <output
                            className={`flex items-baseline gap-2 break-all text-3xl font-semibold tabular-nums sm:text-4xl ${
                                hasAmount && resultValue ? theme.text : ""
                            }`}
                        >
              <span aria-hidden className="text-2xl font-medium text-zinc-500 dark:text-zinc-400">
                {to.symbol}
              </span>
                            {status === "loading" && !resultValue
                                ? "…"
                                : hasAmount && resultValue
                                    ? resultValue
                                    : "—"}
                        </output>
                    )}
                    {unitRateText && (
                        <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {unitRateText}
            </span>
                    )}
                </div>
                <CopyButton value={resultValue} label={`Copy ${to.name} amount`}/>
            </div>

            {status !== "error" && rates && (
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                    Rates as of {formatRateDate(rates.date)}
                </p>
            )}

            <PrecisionControl value={decimals} onChange={setDecimals}/>
        </div>
    );
}
