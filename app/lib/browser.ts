/**
 * Best-effort browser name from the user agent, so messages about missing
 * capabilities can say e.g. "Safari cannot..." instead of the vaguer "Your
 * browser cannot...". Order matters: several browsers embed other engines'
 * names in their UA string (Edge/Opera/Samsung Internet all contain
 * "Chrome/", Chrome/Firefox on iOS use Apple's engine but keep their own
 * "CriOS/"/"FxiOS/" markers).
 */
export function detectBrowserName(): string {
  if (typeof navigator === "undefined") return "Your browser";
  const ua = navigator.userAgent;
  if (/Edg(?:A|iOS)?\//.test(ua)) return "Edge";
  if (/OPR\/|OPiOS\//.test(ua)) return "Opera";
  if (/SamsungBrowser\//.test(ua)) return "Samsung Internet";
  if (/FxiOS\//.test(ua)) return "Firefox";
  if (/CriOS\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\/|Chromium\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Your browser";
}
