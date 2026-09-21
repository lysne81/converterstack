import Link from "next/link";
import { DefinitionCallout, DefinitionSection } from "./DefinitionContent";
import DefinitionShell from "./DefinitionShell";
import { DefinitionFact, DefinitionFactList } from "./DefinitionFacts";
import ConverterCard from "../ConverterCard";
import {
  formatOffset,
  type TimezoneDefinition,
  type TimezoneLink,
} from "../../definitions/timezones/timezones-definitions";

const UTC_HREF = "/definitions/timezones/UTC";

/** Comma-separated links to other zone definitions. */
function ZoneLinks({ zones }: { zones: readonly TimezoneLink[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {zones.map((zone) => (
        <li key={zone.key}>
          <Link
            href={`/definitions/timezones/${zone.key}`}
            className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-300"
          >
            {zone.abbrev} — {zone.name}
          </Link>
          <span className="text-zinc-500 dark:text-zinc-400">
            {" "}
            ({formatOffset(zone.offset)})
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TimezoneDefinitionLayout({
  definition,
}: {
  definition: TimezoneDefinition;
}) {
  const { base } = definition;
  const isUtc = base.key === "UTC";

  return (
    <DefinitionShell
      backHref="/definitions/timezones"
      backLabel="Time zone definitions"
      name={definition.abbrev}
      secondary={`(${definition.name})`}
      lead={definition.description}
    >
      <DefinitionFactList>
        <DefinitionFact
          label="UTC offset"
          value={
            isUtc ? (
              "The reference offset for every other zone"
            ) : (
              <>
                <Link
                  href={UTC_HREF}
                  className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-300"
                >
                  UTC
                </Link>
                {formatOffset(base.offset).replace("UTC", "")}
              </>
            )
          }
        />
        <DefinitionFact label="Abbreviation" value={definition.abbrev} />
        <DefinitionFact label="Full name" value={definition.name} />
        <DefinitionFact
          label="Military letter"
          value={definition.militaryLetter}
        />
        <DefinitionFact label="Regions" value={definition.regions.join(", ")} />
        <DefinitionFact
          label="IANA zones"
          value={
            <span className="font-mono text-sm">
              {definition.ianaZones.join(", ")}
            </span>
          }
        />
        <DefinitionFact label="Converter model" value="Fixed offset." />
      </DefinitionFactList>

      <DefinitionSection title={`What ${definition.abbrev} means`}>
        <p>{definition.usage}</p>
        <ul className="list-disc space-y-2 pl-5">
          {definition.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </DefinitionSection>

      {isUtc && definition.whyReference && (
        <DefinitionSection title="Why this converter uses UTC as its base">
          <p>{definition.whyReference}</p>
          <p>
            It also matches how the rest of the world coordinates: aviation,
            shipping, computer systems and scientific data all record times in
            UTC, so a value converted here can be compared directly with those
            sources.
          </p>
        </DefinitionSection>
      )}

      <DefinitionSection title="Cities on this offset">
        <p>
          These cities keep {formatOffset(base.offset)} as their standard
          offset:
        </p>
        <ul className="flex flex-wrap gap-2">
          {definition.cities.map((city) => (
            <li
              key={city}
              className="rounded-full bg-black/[.04] px-3 py-1 text-sm text-zinc-700 dark:bg-white/[.06] dark:text-zinc-300"
            >
              {city}
            </li>
          ))}
        </ul>
      </DefinitionSection>

      {definition.otherMeanings.length > 0 && (
        <DefinitionSection
          title={`Other meanings of ${definition.abbrev}`}
        >
          <p>
            {definition.abbrev} is used for more than one time zone. This page
            describes {definition.name}; the other meanings have their own
            pages and their own offsets:
          </p>
          <ZoneLinks zones={definition.otherMeanings} />
        </DefinitionSection>
      )}

      {definition.sameOffset.length > 0 && (
        <DefinitionSection title="Zones with the same offset">
          <ZoneLinks zones={definition.sameOffset} />
        </DefinitionSection>
      )}

      {definition.history && (
        <DefinitionSection title="History">
          <p>{definition.history}</p>
        </DefinitionSection>
      )}

      {definition.confusions.length > 0 && (
        <DefinitionSection title="Do not confuse with">
          <ul className="list-disc space-y-2 pl-5">
            {definition.confusions.map((confusion) => (
              <li key={`${confusion.abbrev}-${confusion.name}`}>
                {confusion.key ? (
                  <Link
                    href={`/definitions/timezones/${confusion.key}`}
                    className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-300"
                  >
                    {confusion.abbrev}
                  </Link>
                ) : (
                  <span className="font-medium">{confusion.abbrev}</span>
                )}{" "}
                — {confusion.name}
              </li>
            ))}
          </ul>
        </DefinitionSection>
      )}

      <DefinitionCallout title="Example">{definition.example}</DefinitionCallout>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Convert {definition.abbrev}
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(isUtc
            ? [
                { key: "EST-eastern", abbrev: "EST", name: "Eastern Standard Time" },
                { key: "CET", abbrev: "CET", name: "Central European Time" },
              ]
            : [
                { key: "UTC", abbrev: "UTC", name: "Coordinated Universal Time" },
              ]
          ).map((target) => (
            <li key={target.key}>
              <ConverterCard
                href={`/timezone?from=${base.key}&to=${target.key}`}
                kind="timezone"
                eyebrow="Time zone"
                title={`${definition.abbrev} → ${target.abbrev}`}
                subtitle={`${definition.name} → ${target.name}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </DefinitionShell>
  );
}
