import currenciesJson from "../../public/currencies.json";
import {
  normalizeCurrencies,
  type Currency,
  type CurrencyRecord,
} from "./currency";

/**
 * Build-time currency list read directly from `public/currencies.json`. Only
 * import this from server components (static routes, sitemap) that need the
 * full list during the build — it embeds the whole JSON file. Runtime/browser
 * code should use `getCurrencies()` from `./currency` instead, which fetches
 * `/currencies.json` lazily.
 */
export function getStaticCurrencies(): Currency[] {
  return normalizeCurrencies(
    currenciesJson as { data?: Record<string, CurrencyRecord> },
  );
}
