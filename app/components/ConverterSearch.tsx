"use client";

import {useRouter} from "next/navigation";
import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";
import {
    CATEGORY_LABELS,
    getConversionPairs,
    slugFor,
} from "../lib/units";
import {ZONES, getBase, cityForOffset, BASES, type Base} from "../lib/timezone";
import {useCurrencies} from "../lib/useCurrencies";
import {
    POPULAR_FILE_SLUGS,
    conversionTitle,
    describeFileConversion,
    fileSlugFor,
    getFileConversion,
    getFileConversions,
    getTargetsFor,
} from "../lib/files/registry";
import {FILE_FORMATS, formatKeys} from "../lib/files/formats";
import type {FileConversion, FileFormat} from "../lib/files/types";
import ConverterCard from "./ConverterCard";

const MAX_RESULTS = 24;

const CATEGORY_SYNONYMS: Partial<Record<string, string>> = {
    length: "distance",
    mass: "weight",
    temperature: "heat cold",
};

const TIME_TERMS = ["time", "timezone", "timezones", "zone", "clock", "gmt", "utc"];

// When a single zone is searched, offer conversions to these common zones
// (values are base keys used in `?from=`/`?to=` URLs). Order = most useful first.
const POPULAR_TIMEZONE_TARGETS = [
    "GMT",
    "EST-eastern",
    "PST",
    "CET",
    "JST",
    "IST-india",
    "AEST",
    "UTC",
];
const MAX_TIMEZONE_PAIRS = 6;
// Offset variants surfaced when a base abbreviation is searched (e.g. "GMT"
// → GMT, GMT+1, GMT+2 …). Base first, then east, then west.
const TIMEZONE_OFFSET_STEPS = [0, 1, 2, 3, -1, -2];
const MAX_ZONE_MATCHES = 8;
const CURRENCY_TERMS = [
    "currency",
    "currencies",
    "money",
    "exchange",
    "forex",
    "fx",
];

// When a single currency is searched, offer conversions to these common
// counterparts. Order matters — most-traded first.
const POPULAR_CURRENCY_TARGETS = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CHF",
    "CNY",
    "CAD",
    "AUD",
];
const MAX_CURRENCY_PAIRS = 6;
const MAX_CURRENCY_MATCHES = 8;

const FILE_TERMS = [
    "file",
    "files",
    "image",
    "images",
    "photo",
    "photos",
    "picture",
    "pictures",
    "format",
    "convert",
    "audio",
    "sound",
    "music",
    "song",
    "video",
    "movie",
    "clip",
    "document",
    "compress",
    "extract",
];

// Shortest token that may match a file format. Three characters keeps unit
// queries like "he" (hectare) from pulling in HEIC converters, while every
// format id, alias and extension is still reachable.
const MIN_FILE_TOKEN = 3;
// Keys no longer than this ("mov", "flac", "jpeg") match on any prefix;
// longer word aliases need at least this many characters before they match.
const MAX_SHORT_KEY = 5;
const MAX_FILE_PAIRS = 6;
const MAX_FILE_MATCHES = 6;

const FILE_POPULARITY = new Map<string, number>(
    POPULAR_FILE_SLUGS.map((slug, i) => [slug, i]),
);

function filePopularity(conversion: FileConversion): number {
    return (
        FILE_POPULARITY.get(fileSlugFor(conversion.from, conversion.to)) ??
        Number.MAX_SAFE_INTEGER
    );
}

/**
 * What to offer when a query names a single format: its targets first, then
 * the conversions that produce it, most searched first within each half.
 */
function conversionsForFormat(format: FileFormat): FileConversion[] {
    const byPopularity = (a: FileConversion, b: FileConversion) =>
        filePopularity(a) - filePopularity(b);
    const outgoing = getTargetsFor(format)
        .map((to) => getFileConversion(format.id, to.id))
        .filter((c): c is FileConversion => c !== null)
        .sort(byPopularity);
    const incoming = getFileConversions()
        .filter((c) => c.to.id === format.id)
        .sort(byPopularity);
    return [...outgoing, ...incoming];
}

/**
 * The first conversion linking any candidate of two tokens, trying both
 * directions so "mp3 mp4" finds MP4 → MP3.
 */
function firstConversion(
    from: FileFormat[],
    to: FileFormat[],
): FileConversion | null {
    for (const a of from) {
        for (const b of to) {
            const forward = getFileConversion(a.id, b.id);
            if (forward) return forward;
        }
    }
    for (const a of from) {
        for (const b of to) {
            const reverse = getFileConversion(b.id, a.id);
            if (reverse) return reverse;
        }
    }
    return null;
}

export default function ConverterSearch() {
    const router = useRouter();
    const currencies = useCurrencies();
    const pairs = useMemo(() => getConversionPairs(), []);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const listId = useId();

    useEffect(() => {
        function onPointerDown(e: MouseEvent) {
            if (!sectionRef.current?.contains(e.target as Node)) setOpen(false);
        }

        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    const indexed = useMemo(
        () =>
            pairs.map((pair) => ({
                pair,
                fromWords: new Set(
                    [
                        pair.from.label,
                        pair.from.symbol,
                        pair.from.id,
                        CATEGORY_LABELS[pair.from.category],
                        CATEGORY_SYNONYMS[pair.from.category] ?? "",
                    ]
                        .join(" ")
                        .toLowerCase()
                        .split(/\s+/)
                        .filter(Boolean),
                ),
                fromHay: [
                    pair.from.label,
                    pair.from.symbol,
                    pair.from.id,
                    CATEGORY_LABELS[pair.from.category],
                    CATEGORY_SYNONYMS[pair.from.category] ?? "",
                ]
                    .join(" ")
                    .toLowerCase(),
                haystack: [
                    pair.from.label,
                    pair.from.symbol,
                    pair.from.id,
                    pair.to.label,
                    pair.to.symbol,
                    pair.to.id,
                    CATEGORY_LABELS[pair.from.category],
                    CATEGORY_SYNONYMS[pair.from.category] ?? "",
                    `${pair.from.label} to ${pair.to.label}`,
                ]
                    .join(" ")
                    .toLowerCase(),
            })),
        [pairs],
    );

    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t && t !== "to");

    const results =
        tokens.length === 0
            ? indexed.map(({pair}) => pair)
            : indexed
                .filter(({haystack}) => tokens.every((t) => haystack.includes(t)))
                .map((entry) => {
                    // Rank from-unit matches: exact word > word-prefix > substring.
                    // So "m", "me", "meter", "meters" all rank Meters above Centimeters.
                    const words = [...entry.fromWords];
                    let score = 0;
                    for (const t of tokens) {
                        if (entry.fromWords.has(t)) score += 4;
                        else if (words.some((w) => w.startsWith(t))) score += 2;
                    }
                    if (tokens.every((t) => entry.fromHay.includes(t))) score += 1;
                    return {...entry, score};
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_RESULTS)
                .map(({pair}) => pair);

    // Special one-off tools (time zone, currency) surfaced ahead of the unit
    // pairs when the query is empty or matches their domain. Each is keyboard-
    // navigable and, when a specific zone/currency is named, prefills the tool.
    type Special = {
        key: string;
        href: string;
        kind: "timezone" | "currency" | "file";
        eyebrow: string;
        title: string;
        subtitle: string;
    };

    // A matched zone carries the `?from=`/`?to=` param plus display strings.
    // `param` may be a base key ("EST") or a base + inline offset ("GMT+2").
    type MatchedZone = { param: string; abbrev: string; label: string };

    let showTzGeneric = tokens.length === 0;
    let showCurrencyGeneric = tokens.length === 0;
    let showFileGeneric = tokens.length === 0;

    function offsetZone(base: Base, inc: number): MatchedZone {
        const suffix = inc === 0 ? "" : `${inc > 0 ? "+" : ""}${inc}`;
        const city = cityForOffset(base.offset + inc * 60);
        return {
            param: `${base.key}${suffix}`,
            abbrev: `${base.abbrev}${suffix}`,
            label: inc === 0 ? base.name : (city ?? base.name),
        };
    }

    function parseOffsetToken(token: string): MatchedZone | undefined {
        // e.g. "gmt+2", "utc-1", "cet+5" → base key with an explicit hour offset.
        const m = /^([a-z]+)([+-]\d{1,2})$/.exec(token);
        if (!m) return undefined;
        const key = m[1].toUpperCase();
        const base = getBase(key);
        if (!base) return undefined;
        const inc = Number(m[2]);
        if (!Number.isFinite(inc)) return undefined;
        return offsetZone(base, inc);
    }

    // All zones a single token resolves to: an explicit offset, the matching
    // base abbreviations (every meaning of an ambiguous one, e.g. "ist" → India,
    // Irish, Israel), their nearby offset variants when only one base matches,
    // plus city matches.
    function zonesForToken(t: string): MatchedZone[] {
        const explicit = parseOffsetToken(t);
        if (explicit) return [explicit];
        const out: MatchedZone[] = [];
        const seen = new Set<string>();
        const add = (z: MatchedZone) => {
            if (!seen.has(z.param)) {
                seen.add(z.param);
                out.push(z);
            }
        };
        const matched = BASES.filter(
            (base) =>
                base.abbrev.toLowerCase().startsWith(t) ||
                base.key.toLowerCase().startsWith(t),
        );
        if (matched.length === 1) {
            for (const inc of TIMEZONE_OFFSET_STEPS) add(offsetZone(matched[0], inc));
        } else {
            for (const base of matched) add(offsetZone(base, 0));
        }
        for (const z of ZONES) {
            if (
                z.id.startsWith(t) ||
                z.abbrev.toLowerCase().startsWith(t) ||
                z.label.toLowerCase().startsWith(t) ||
                z.label.toLowerCase().split(/\s+/).some((w) => w.startsWith(t))
            ) {
                add({param: z.base, abbrev: z.abbrev, label: z.label});
            }
        }
        return out;
    }

    // All currency codes a single token resolves to (prefix on code or name).
    function currenciesForToken(t: string): string[] {
        return currencies.filter(
            (c) =>
                c.code.toLowerCase().startsWith(t) ||
                c.name.toLowerCase().startsWith(t) ||
                c.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(t)),
        ).map((c) => c.code);
    }

    // All file formats a single token resolves to (prefix on id, alias or
    // extension, with an optional leading dot). An exact key match wins
    // outright, so "mp4" is the MP4 format rather than a prefix of M4A's
    // "mp4a" alias. Long word aliases ("acrobat", "iphone") need a longer
    // prefix, so unit queries like "acr" for acres stay out of the way.
    function formatsForToken(raw: string): FileFormat[] {
        const t = raw.replace(/^\./, "");
        if (t.length < MIN_FILE_TOKEN) return [];
        const hits = (format: FileFormat, test: (key: string) => boolean) =>
            formatKeys(format).some(test);
        const matches = FILE_FORMATS.filter((format) =>
            hits(
                format,
                (key) =>
                    key.startsWith(t) &&
                    (key.length <= MAX_SHORT_KEY ||
                        t.length >= MAX_SHORT_KEY ||
                        key === t),
            ),
        );
        const exact = matches.filter((format) =>
            hits(format, (key) => key === t),
        );
        return exact.length > 0 ? exact : matches;
    }

    const zoneTokens: MatchedZone[][] = [];
    const currencyTokens: string[][] = [];
    const fileTokens: FileFormat[][] = [];
    // A token matches a generic term when it equals it or is a prefix of it
    // (≥3 chars), so "curr"→currency, "timez"→timezone, "exch"→exchange.
    const matchesTerm = (t: string, terms: string[]) =>
        terms.some((term) => term === t || (t.length >= 3 && term.startsWith(t)));
    for (const t of tokens) {
        if (matchesTerm(t, TIME_TERMS)) showTzGeneric = true;
        if (matchesTerm(t, CURRENCY_TERMS)) showCurrencyGeneric = true;
        if (matchesTerm(t, FILE_TERMS)) showFileGeneric = true;
        const zc = zonesForToken(t);
        if (zc.length) zoneTokens.push(zc);
        const cc = currenciesForToken(t);
        if (cc.length) currencyTokens.push(cc);
        const fc = formatsForToken(t);
        if (fc.length) fileTokens.push(fc);
    }

    function zoneForBase(base: string) {
        return ZONES.find((z) => z.base === base);
    }

    function timezonePair(from: MatchedZone, toParam: string): Special {
        const to = zoneForBase(toParam);
        return {
            key: `tz-${from.param}-${toParam}`,
            href: `/timezone?from=${encodeURIComponent(from.param)}&to=${encodeURIComponent(toParam)}`,
            kind: "timezone",
            eyebrow: "Time zone",
            title: `${from.abbrev} → ${to?.abbrev ?? toParam}`,
            subtitle: `${from.label} → ${to?.label ?? toParam}`,
        };
    }

    function timezoneFrom(zone: MatchedZone): Special {
        return {
            key: `tz-${zone.param}`,
            href: `/timezone?from=${encodeURIComponent(zone.param)}`,
            kind: "timezone",
            eyebrow: "Time zone",
            title: zone.abbrev,
            subtitle: zone.label,
        };
    }

    function currencyPair(from: string, to: string): Special {
        const fromName = currencies.find(c => c.code == from)?.name ?? from;
        const toName = currencies.find(c => c.code == to)?.name ?? to;
        return {
            key: `currency-${from}-${to}`,
            href: `/exchangerate?from=${from}&to=${to}`,
            kind: "currency",
            eyebrow: "Exchange rates",
            title: `${from} → ${to}`,
            subtitle: `${fromName} to ${toName}`,
        };
    }

    function currencyFrom(code: string): Special {
        return {
            key: `currency-${code}`,
            href: `/exchangerate?from=${code}`,
            kind: "currency",
            eyebrow: "Exchange rates",
            title: code,
            subtitle: currencies.find(c => c.code == code)?.name ?? code
        }
            ;
    }

    function fileSpecial(conversion: FileConversion): Special {
        return {
            key: `file-${fileSlugFor(conversion.from, conversion.to)}`,
            href: `/files/${fileSlugFor(conversion.from, conversion.to)}`,
            kind: "file",
            eyebrow: "File",
            title: conversionTitle(conversion),
            subtitle: describeFileConversion(conversion),
        };
    }

    const specials: Special[] = [];

    // Time zones: two matched tokens → exact pair; one token with a single match
    // → expand to popular zones; one token with several matches → list them.
    if (zoneTokens.length >= 2) {
        specials.push(timezonePair(zoneTokens[0][0], zoneTokens[1][0].param));
    } else if (zoneTokens.length === 1) {
        const cands = zoneTokens[0];
        if (cands.length === 1) {
            const from = cands[0];
            for (const toBase of POPULAR_TIMEZONE_TARGETS) {
                if (toBase === from.param) continue;
                specials.push(timezonePair(from, toBase));
                if (specials.length >= MAX_TIMEZONE_PAIRS) break;
            }
        } else {
            for (const zone of cands.slice(0, MAX_ZONE_MATCHES)) {
                specials.push(timezoneFrom(zone));
            }
        }
    } else if (showTzGeneric) {
        specials.push({
            key: "timezone",
            href: "/timezone",
            kind: "timezone",
            eyebrow: "Time zone",
            title: "Time zones",
            subtitle: "Convert time between zones and cities",
        });
    }

    // Currencies: same shape as time zones.
    const beforeCurrency = specials.length;
    if (currencyTokens.length >= 2) {
        specials.push(currencyPair(currencyTokens[0][0], currencyTokens[1][0]));
    } else if (currencyTokens.length === 1) {
        const cands = currencyTokens[0];
        if (cands.length === 1) {
            const from = cands[0];
            for (const to of POPULAR_CURRENCY_TARGETS) {
                if (to === from) continue;
                specials.push(currencyPair(from, to));
                if (specials.length - beforeCurrency >= MAX_CURRENCY_PAIRS) break;
            }
        } else {
            for (const code of cands.slice(0, MAX_CURRENCY_MATCHES)) {
                specials.push(currencyFrom(code));
            }
        }
    } else if (showCurrencyGeneric) {
        specials.push({
            key: "currency",
            href: "/exchangerate",
            kind: "currency",
            eyebrow: "Exchange rates",
            title: "Exchange rates",
            subtitle: "Convert money at daily exchange rates",
        });
    }
    // File formats: two matched tokens → the exact conversion (in either
    // direction); one token → its most popular conversions; a generic term →
    // the hub.
    const beforeFiles = specials.length;
    if (fileTokens.length >= 2) {
        const conversion = firstConversion(fileTokens[0], fileTokens[1]);
        if (conversion) specials.push(fileSpecial(conversion));
    } else if (fileTokens.length === 1) {
        const cands = fileTokens[0];
        if (cands.length === 1) {
            for (const conversion of conversionsForFormat(cands[0])) {
                specials.push(fileSpecial(conversion));
                if (specials.length - beforeFiles >= MAX_FILE_PAIRS) break;
            }
        } else {
            for (const format of cands.slice(0, MAX_FILE_MATCHES)) {
                const conversion = conversionsForFormat(format)[0];
                if (conversion) specials.push(fileSpecial(conversion));
            }
        }
    } else if (showFileGeneric) {
        specials.push({
            key: "files",
            href: "/files",
            kind: "file",
            eyebrow: "File",
            title: "File converter",
            subtitle: "Convert images, audio, video and PDF without uploading",
        });
    }

    const specialCount = specials.length;
    const total = specialCount + results.length;

    function getColumns(): number {
        const list = listRef.current;
        if (!list) return 1;
        const items = Array.from(list.querySelectorAll<HTMLElement>("[data-index]"));
        if (items.length === 0) return 1;
        const firstTop = items[0].offsetTop;
        const cols = items.filter((el) => el.offsetTop === firstTop).length;
        return Math.max(cols, 1);
    }

    function moveActive(next: number) {
        const clamped = Math.min(Math.max(next, 0), total - 1);
        setActiveIndex(clamped);
        const el = listRef.current?.querySelector<HTMLElement>(
            `[data-index="${clamped}"]`,
        );
        el?.scrollIntoView({block: "nearest"});
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
        }
        if (total === 0) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                moveActive(activeIndex + getColumns());
                break;
            case "ArrowUp":
                e.preventDefault();
                moveActive(activeIndex - getColumns());
                break;
            case "ArrowRight":
                e.preventDefault();
                moveActive(activeIndex + 1);
                break;
            case "ArrowLeft":
                e.preventDefault();
                moveActive(activeIndex - 1);
                break;
            case "Home":
                e.preventDefault();
                moveActive(0);
                break;
            case "End":
                e.preventDefault();
                moveActive(total - 1);
                break;
            case "Enter": {
                e.preventDefault();
                if (activeIndex < specialCount) {
                    router.push(specials[activeIndex].href);
                    break;
                }
                const pair = results[activeIndex - specialCount];
                if (pair) router.push(`/${slugFor(pair.from, pair.to)}`);
                break;
            }
        }
    }

    const showDropdown = open;

    const activeDescendant =
        showDropdown && activeIndex < total
            ? `${listId}-opt-${activeIndex}`
            : undefined;

    return (
        <section ref={sectionRef} className="relative flex flex-col gap-3">
            <label htmlFor="converter-search" className="sr-only">
                Search converters
            </label>
            <div className="relative">
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                    id="converter-search"
                    type="search"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={listId}
                    aria-activedescendant={activeDescendant}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActiveIndex(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search (e.g. “kg to lb”, “USD to EUR”, “time zones”)"
                    className="h-14 w-full rounded-xl border border-black/15 bg-white pl-12 pr-4 text-base shadow-sm transition-shadow focus:border-blue-500/60 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/20 dark:bg-zinc-950 dark:focus:border-blue-400/60 dark:focus:ring-blue-400/25"
                />
            </div>

            {showDropdown && (
                <div
                    aria-live="polite"
                    className="absolute left-0 right-0 top-16 z-20 max-h-[26rem] overflow-auto rounded-lg border border-black/10 bg-white p-2 shadow-lg dark:border-white/15 dark:bg-zinc-900"
                >
                    {total === 0 ? (
                        <p className="px-1 py-2 text-sm text-zinc-500">
                            No converters match “{query}”.
                        </p>
                    ) : (
                        <ul
                            ref={listRef}
                            role="listbox"
                            id={listId}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                        >
                            {specials.map((special, i) => (
                                <li
                                    key={special.key}
                                    id={`${listId}-opt-${i}`}
                                    role="option"
                                    aria-selected={activeIndex === i}
                                    data-index={i}
                                >
                                    <ConverterCard
                                        href={special.href}
                                        kind={special.kind}
                                        eyebrow={special.eyebrow}
                                        active={activeIndex === i}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        title={special.title}
                                        subtitle={special.subtitle}
                                    />
                                </li>
                            ))}
                            {results.map(({from, to}, i) => {
                                const index = i + specialCount;
                                const active = index === activeIndex;
                                return (
                                    <li
                                        key={slugFor(from, to)}
                                        id={`${listId}-opt-${index}`}
                                        role="option"
                                        aria-selected={active}
                                        data-index={index}
                                    >
                                        <ConverterCard
                                            href={`/${slugFor(from, to)}`}
                                            from={from}
                                            to={to}
                                            active={active}
                                            onMouseEnter={() => setActiveIndex(index)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}
