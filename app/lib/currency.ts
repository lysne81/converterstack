const BASE = "USD";
const RATES_ENDPOINT = "/ex_rates.json";
const CURRENCIES_ENDPOINT = "/currencies.json";

export type Currency = {
    code: string;
    name: string;
    symbol: string;
    /** e.g. "fiat", "crypto", "metal". */
    type: string;
    /** ISO 3166-1 alpha-2 country codes using this currency (fiat only). */
    countries: string[];
};

export type CurrencyRecord = {
    code?: string;
    name?: string;
    symbol?: string;
    symbol_native?: string;
    type?: string;
    countries?: string[];
};

/**
 * Wrap a loader so it runs at most once: the first call starts the request and
 * every later call reuses the same result. Lazy — nothing is fetched until the
 * returned function is called. A rejected load is not cached, so a later call
 * can retry.
 */
function loadOnce<T>(load: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | null = null;
    return () => {
        promise ??= load().catch((err) => {
            promise = null;
            throw err;
        });
        return promise;
    };
}

/**
 * Currency list from /currencies.json. Fetched lazily on first use and reused
 * for the lifetime of the page.
 */
export const getCurrencies: () => Promise<Currency[]> = loadOnce(fetchCurrencies);

/** Shape check for a currency code, usable before the list has loaded. */
export function isCurrencyCode(code: string | null | undefined): code is string {
    return !!code && /^[A-Za-z]{3}$/.test(code);
}

export const DEFAULT_FROM = "USD";
export const DEFAULT_TO = "EUR";

/** A resolved rate set. `rates` are relative to `base` (base itself = 1). */
export type Rates = {
    base: string;
    /** Reference timestamp from ex_rates.json. */
    date: string;
    rates: Record<string, number>;
    /** ISO timestamp of the successful fetch. */
    fetchedAt: string;
};

export function normalizeCurrencies(json: {
    data?: Record<string, CurrencyRecord>;
}): Currency[] {
    if (!json.data || typeof json.data !== "object") {
        throw new Error("Currency file is missing its data object");
    }

    return Object.values(json.data)
        .filter(
            (currency): currency is CurrencyRecord & { code: string; name: string } =>
                typeof currency.code === "string" &&
                typeof currency.name === "string",
        )
        .map((currency) => ({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol_native ?? currency.symbol ?? currency.code,
            type: currency.type ?? "fiat",
            countries: currency.countries ?? [],
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
}

/** Fetch and normalise the currency definitions file. */
export async function fetchCurrencies(): Promise<Currency[]> {
    const res = await fetch(CURRENCIES_ENDPOINT, {
        headers: {Accept: "application/json"},
    });
    if (!res.ok) throw new Error(`Currency file responded ${res.status}`);

    return normalizeCurrencies(
        (await res.json()) as { data?: Record<string, CurrencyRecord> },
    );
}

type RatePayload = {
    base?: unknown;
    date?: unknown;
    rates?: unknown;
    data?: unknown;
    meta?: {
        last_updated_at?: unknown;
    };
};

/**
 * The rate file reports its reference instant as the last second of the day
 * (23:59:59Z). Add one second so it reads as the start of the next day.
 */
function addOneSecond(timestamp: string): string {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return timestamp;
    return new Date(d.getTime() + 1000).toISOString();
}

/** Fetch and normalise the generated exchange-rate file. */
export async function fetchRates(): Promise<Rates> {
    const res = await fetch(RATES_ENDPOINT, {headers: {Accept: "application/json"}});
    if (!res.ok) throw new Error(`Exchange-rate file responded ${res.status}`);
    const json = (await res.json()) as RatePayload | Record<string, unknown>;
    const payload = json as RatePayload;
    const rawRates =
        payload.rates && typeof payload.rates === "object"
            ? payload.rates
            : payload.data && typeof payload.data === "object"
                ? payload.data
                : json;
    if (!rawRates || typeof rawRates !== "object") {
        throw new Error("Exchange-rate file does not contain a rate map");
    }

    const rates = Object.fromEntries(
        Object.entries(rawRates)
            .map(([code, value]) => {
                const numericValue =
                    typeof value === "number"
                        ? value
                        : value &&
                        typeof value === "object" &&
                        "value" in value &&
                        typeof value.value === "number"
                            ? value.value
                            : undefined;
                return [code, numericValue] as const;
            })
            .filter(
                ([code, value]) =>
                    code.length === 3 &&
                    typeof value === "number" &&
                    Number.isFinite(value),
            ),
    );
    const base =
        typeof payload.base === "string" && payload.base.length === 3
            ? payload.base
            : BASE;
    const date =
        typeof payload.meta?.last_updated_at === "string"
            ? addOneSecond(payload.meta.last_updated_at)
            : typeof payload.date === "string"
                ? payload.date
                : new Date().toISOString();

    // The API omits the base currency from `rates`; inject it as 1 so cross-rate
    // conversion works uniformly for every pair including the base.
    rates[base] = 1;
    return {
        base,
        date,
        rates,
        fetchedAt: new Date().toISOString(),
    };
}

/**
 * Exchange rates from /ex_rates.json. Fetched lazily on first use and reused
 * for the lifetime of the page.
 */
export const getRates: () => Promise<Rates> = loadOnce(fetchRates);

/**
 * Convert `amount` from one currency to another using cross-rates relative to
 * the fetched base: `amount * rate[to] / rate[from]`. Returns NaN when a rate
 * is missing.
 */
export function convert(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>,
): number {
    const rf = rates[from];
    const rt = rates[to];
    if (!Number.isFinite(rf) || !Number.isFinite(rt) || rf === 0) return NaN;
    return (amount * rt) / rf;
}

/** Human-readable exchange-rate reference date in the system locale. */
export function formatRateDate(date: string): string {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const d = isDateOnly ? new Date(`${date}T00:00:00`) : new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    });
}
