export type RecentEntry = {
  slug: string;
  fromLabel: string;
  toLabel: string;
};

const KEY = "recentConverters";
const MAX = 3;

/** The stable identity of a slug ignores any query string (e.g. tool presets). */
function slugPath(slug: string): string {
  return slug.split("?")[0];
}

const EMPTY: RecentEntry[] = [];
let cache: RecentEntry[] = EMPTY;
let cacheRaw: string | null = null;

export function subscribeRecent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/** Cached snapshot for useSyncExternalStore (stable reference unless storage changes). */
export function getRecentSnapshot(): RecentEntry[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  cache = getRecent();
  return cache;
}

export function getRecent(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX);
  } catch {
    return [];
  }
}

export function addRecent(entry: RecentEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecent().filter(
      (e) => slugPath(e.slug) !== slugPath(entry.slug),
    );
    const next = [entry, ...existing].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (private mode, quota)
  }
}
