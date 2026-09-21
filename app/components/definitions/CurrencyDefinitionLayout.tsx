"use client";

import Link from "next/link";
import DefinitionShell from "./DefinitionShell";
import { DefinitionFact, DefinitionFactList } from "./DefinitionFacts";
import ConverterCard from "../ConverterCard";
import { useCurrencies } from "../../lib/useCurrencies";
import { countryFlagSrc, countryName } from "../../lib/countries";

const TYPE_LABELS: Record<string, string> = {
  fiat: "Fiat currency",
  crypto: "Cryptocurrency",
  metal: "Precious metal",
};

/** Country chips: flag icon (where available) plus the full country name. */
function CountryList({ codes }: { codes: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {codes.map((code) => {
        const flagSrc = countryFlagSrc(code);
        return (
          <li
            key={code}
            className="flex items-center gap-1.5 rounded-full bg-black/[.04] px-3 py-1 text-sm text-zinc-700 dark:bg-white/[.06] dark:text-zinc-300"
          >
            {flagSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flagSrc}
                alt=""
                aria-hidden
                className="h-3.5 w-5 rounded-[2px] object-cover"
              />
            )}
            {countryName(code)}
          </li>
        );
      })}
    </ul>
  );
}

export default function CurrencyDefinitionLayout({ code }: { code: string }) {
  const currencies = useCurrencies();
  const currency = currencies.find((c) => c.code === code);

  if (!currency) {
    return (
      <DefinitionShell
        backHref="/definitions/currencies"
        backLabel="Currency definitions"
        name={code}
        lead="Loading currency definition…"
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          Currency details are fetched from the currency list; if this
          message persists, the data file may be unavailable.
        </p>
      </DefinitionShell>
    );
  }

  const typeLabel = TYPE_LABELS[currency.type] ?? currency.type;

  return (
    <DefinitionShell
      backHref="/definitions/currencies"
      backLabel="Currency definitions"
      name={currency.code}
      secondary={`(${currency.name})`}
      lead={`${currency.name} is identified by the currency code ${currency.code}.`}
    >
      <DefinitionFactList>
        <DefinitionFact label="Abbreviation" value={currency.code} />
        <DefinitionFact label="Name" value={currency.name} />
        <DefinitionFact label="Symbol" value={currency.symbol} />
        <DefinitionFact label="Type" value={typeLabel} />
        {currency.type === "fiat" && currency.countries.length > 0 && (
          <DefinitionFact
            label="Countries"
            value={<CountryList codes={currency.countries} />}
          />
        )}
      </DefinitionFactList>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Convert {currency.code}
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(currency.code === "USD"
            ? [{ code: "EUR", name: "Euro" }]
            : [{ code: "USD", name: "US Dollar" }]
          ).map((target) => (
            <li key={target.code}>
              <ConverterCard
                href={`/exchangerate?from=${currency.code}&to=${target.code}`}
                kind="currency"
                eyebrow="Exchange rates"
                title={`${currency.code} → ${target.code}`}
                subtitle={`${currency.name} → ${target.name}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/definitions/currencies"
          className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-300"
        >
          Browse all currency definitions →
        </Link>
      </p>
    </DefinitionShell>
  );
}
