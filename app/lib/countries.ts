/**
 * Country display names and flag icons for ISO 3166-1 alpha-2 codes used by
 * `public/currencies.json`. Flag SVGs are downloaded to `public/flags/` (see
 * scripts/fetch_flags.sh); a handful of special/historical codes (e.g. AC,
 * CP, DG, EA, FX, IC, SU, TA) have no standard flag and render without an
 * icon. `UK` is aliased to the `GB` flag since it is not itself an ISO code.
 */

const FLAG_ALIASES: Record<string, string> = {
  UK: "GB",
};

const NO_FLAG = new Set(["AC", "CP", "DG", "EA", "FX", "IC", "SU", "TA"]);

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

/** Full country name for an ISO 3166-1 alpha-2 code, falling back to the code. */
export function countryName(code: string): string {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Path to the flag icon for a country code, or null if none is available. */
export function countryFlagSrc(code: string): string | null {
  if (NO_FLAG.has(code)) return null;
  const flagCode = FLAG_ALIASES[code] ?? code;
  return `/flags/${flagCode.toLowerCase()}.svg`;
}
