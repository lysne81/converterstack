export const MIN_DECIMALS = 0;
export const MAX_DECIMALS = 15;
export const DEFAULT_DECIMALS = 3;

const DECIMALS_KEY = "decimals";
const decimalsListeners = new Set<() => void>();

export function subscribeDecimals(callback: () => void): () => void {
  decimalsListeners.add(callback);
  return () => decimalsListeners.delete(callback);
}

export function getDecimals(): number {
  if (typeof window === "undefined") return DEFAULT_DECIMALS;
  const raw = window.localStorage.getItem(DECIMALS_KEY);
  if (raw === null || raw === "") return DEFAULT_DECIMALS;
  const stored = Number(raw);
  if (Number.isFinite(stored) && stored >= MIN_DECIMALS && stored <= MAX_DECIMALS) {
    return stored;
  }
  return DEFAULT_DECIMALS;
}

export function setDecimals(value: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DECIMALS_KEY, String(value));
  decimalsListeners.forEach((l) => l());
}

export type ClockFormat = "24h" | "12h";
export const DEFAULT_CLOCK: ClockFormat = "24h";

const CLOCK_KEY = "clock";
const clockListeners = new Set<() => void>();

export function subscribeClock(callback: () => void): () => void {
  clockListeners.add(callback);
  return () => clockListeners.delete(callback);
}

export function getClock(): ClockFormat {
  if (typeof window === "undefined") return DEFAULT_CLOCK;
  return window.localStorage.getItem(CLOCK_KEY) === "12h" ? "12h" : "24h";
}

export function setClock(value: ClockFormat): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLOCK_KEY, value);
  clockListeners.forEach((l) => l());
}

/**
 * Format a number to a fixed number of decimals with locale grouping,
 * trimming insignificant trailing zeros. Returns "—" for non-finite input.
 */
export function formatNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "—";
  const clamped = Math.min(Math.max(decimals, MIN_DECIMALS), MAX_DECIMALS);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: clamped,
  }).format(value);
}
