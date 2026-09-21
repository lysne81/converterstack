import type { Metadata } from "next";
import Link from "next/link";
import DefinitionsSearch, {
  type DefinitionSearchGroup,
} from "../../components/definitions/DefinitionsSearch";
import { SITE_URL } from "../../lib/site";
import {
  formatOffset,
  getAmbiguousAbbreviations,
  getTimezoneDefinitions,
} from "./timezones-definitions";

export const metadata: Metadata = {
  title: "Time zone definitions",
  description:
    "Definitions of the fixed-offset time zone abbreviations used by the time zone converter.",
  alternates: { canonical: `${SITE_URL}/definitions/timezones` },
};

export default function TimezoneDefinitionsPage() {
  const definitions = getTimezoneDefinitions();

  const groups: DefinitionSearchGroup[] = [
    {
      key: "timezones",
      label: "Time zones",
      items: definitions.map((definition) => ({
        id: definition.slug,
        href: `/definitions/timezones/${definition.slug}`,
        name: definition.abbrev,
        symbol: formatOffset(definition.base.offset),
        description: `${definition.name} · ${definition.cities
          .slice(0, 3)
          .join(", ")}`,
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
            Time zone definitions
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Learn what each fixed-offset abbreviation means in this converter.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {getAmbiguousAbbreviations().join(", ")} each mean more than one
            time zone, so every meaning has its own page and its own offset.
          </p>
        </header>

        <DefinitionsSearch
          groups={groups}
          inputLabel="Search time zone definitions"
          placeholder="Search time zones (e.g. UTC, CET, JST)"
          emptyLabel="time zone definitions"
        />

        <Link
          href="/definitions/timezones/daylight-saving-time"
          className="block rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-900"
        >
          <span className="font-semibold">Daylight saving time (DST)</span>
          <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Learn what seasonal clock changes are, where they are used, and why
            they were established.
          </span>
        </Link>

        <Link
          href="/timezone"
          className="w-fit text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
        >
          Open the time zone converter →
        </Link>
      </main>
    </div>
  );
}
