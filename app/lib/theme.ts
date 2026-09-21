export type Theme = "system" | "light" | "dark";

const KEY = "theme";

const listeners = new Set<() => void>();

export function subscribeTheme(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emit() {
  listeners.forEach((l) => l());
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(KEY);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}

export function applyTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
  emit();
}

/**
 * Inline script string injected in <head> to set the theme before first paint,
 * avoiding a flash of the wrong theme.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem('theme') || 'system';
    var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = t === 'dark' || (t === 'system' && m);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;
