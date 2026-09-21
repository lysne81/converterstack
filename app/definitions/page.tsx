import type { Metadata } from "next";
import Link from "next/link";
import DefinitionsSearch, {
  type DefinitionSearchGroup,
} from "../components/definitions/DefinitionsSearch";
import { SITE_URL } from "../lib/site";
import { getPublishedDefinitions } from "./units/units-definitions";
import { getTimezoneDefinitions } from "./timezones/timezones-definitions";
import { getStaticCurrencies } from "../lib/currency-static";

const publishedUnitDefinitions = getPublishedDefinitions();
const timezoneDefinitions = getTimezoneDefinitions();
const currencyDefinitions = getStaticCurrencies();

export const metadata: Metadata = {
  title: "Definitions",
  description:
    "Definitions for conversion units, currency codes, and time zone abbreviations: what they mean, how they relate to reference values, and where they are used.",
  alternates: { canonical: `${SITE_URL}/definitions` },
};

type DefinitionKindCard = {
  href: string;
  title: string;
  description: string;
  count: string;
};

const kindCards: DefinitionKindCard[] = [
  {
    href: "/definitions/units",
    title: "Units",
    description:
      "Length, mass, temperature, area, volume, cooking, speed, pressure, energy, and power units.",
    count: `${publishedUnitDefinitions.length} published`,
  },
  {
    href: "/definitions/timezones",
    title: "Time zones",
    description:
      "Fixed-offset time zone abbreviations used by the time zone converter.",
    count: `${timezoneDefinitions.length} time zones`,
  },
  {
    href: "/definitions/currencies",
    title: "Currencies",
    description:
      "Currency codes, names, symbols, types, and the countries that use each fiat currency.",
    count: `${currencyDefinitions.length} currencies`,
  },
];

export default function DefinitionsPage() {
  const groups: DefinitionSearchGroup[] = [
    {
      key: "units",
      label: "Units",
      items: publishedUnitDefinitions.map(({ unit, name }) => ({
        id: unit.id,
        href: `/definitions/units/${unit.id}`,
        name: name ?? unit.label,
        symbol: unit.symbol,
      })),
    },
    {
      key: "timezones",
      label: "Time zones",
      items: timezoneDefinitions.map((definition) => ({
        id: definition.slug,
        href: `/definitions/timezones/${definition.slug}`,
        name: definition.abbrev,
        symbol: definition.name,
      })),
    },
    {
      key: "currencies",
      label: "Currencies",
      items: currencyDefinitions.map((currency) => ({
        id: currency.code,
        href: `/definitions/currencies/${currency.code}`,
        name: currency.code,
        symbol: currency.symbol,
        description: currency.name,
      })),
    },
    {
      key: "timezone-concepts",
      label: "Time zone concepts",
      items: [
        {
          id: "daylight-saving-time",
          href: "/definitions/timezones/daylight-saving-time",
          name: "Daylight saving time",
          symbol: "DST",
          description:
            "Seasonal clock changes, where they are used, and their history.",
        },
      ],
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Definitions
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Learn what conversion units, currency codes, and time zone
            abbreviations mean, where they are used, and how they relate to a
            reference value.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2">
          {kindCards.map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className="flex h-full flex-col gap-1 rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-900"
              >
                <span className="font-semibold">{card.title}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {card.description}
                </span>
                <span className="mt-auto text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {card.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {groups.length > 0 ? (
          <DefinitionsSearch
            groups={groups}
            inputLabel="Search all definitions"
            placeholder="Search units and time zones (e.g. meter, kg, UTC)"
            emptyLabel="definitions"
          />
        ) : (
          <div className="rounded-2xl bg-white p-6 text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
            <p>Reviewed definitions are coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
