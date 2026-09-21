import type { Metadata } from "next";
import Link from "next/link";
import DefinitionsSearch, {
  type DefinitionSearchGroup,
} from "../../components/definitions/DefinitionsSearch";
import { SITE_URL } from "../../lib/site";
import { getStaticCurrencies } from "../../lib/currency-static";

export const metadata: Metadata = {
  title: "Currency definitions",
  description:
    "Definitions of currency codes: name, symbol, type, and the countries that use each fiat currency.",
  alternates: { canonical: `${SITE_URL}/definitions/currencies` },
};

export default function CurrencyDefinitionsPage() {
  const currencies = getStaticCurrencies();

  const groups: DefinitionSearchGroup[] = [
    {
      key: "currencies",
      label: "Currencies",
      items: currencies.map((currency) => ({
        id: currency.code,
        href: `/definitions/currencies/${currency.code}`,
        name: currency.code,
        symbol: currency.symbol,
        description: currency.name,
      })),
    },
  ];

  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Link
            href="/definitions"
            className="w-fit text-sm text-zinc-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-400"
          >
            ← Definitions
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Currency definitions
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Learn what each currency code means: its name, symbol, type, and
            the countries that use it.
          </p>
        </header>

        <DefinitionsSearch
          groups={groups}
          inputLabel="Search currency definitions"
          placeholder="Search currencies (e.g. USD, Euro, Bitcoin)"
          emptyLabel="currency definitions"
        />

        <Link
          href="/exchangerate"
          className="w-fit text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
        >
          Open the exchange rate converter →
        </Link>
      </main>
    </div>
  );
}
