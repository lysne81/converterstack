import type { Metadata } from "next";
import Link from "next/link";
import DefinitionShell from "../../../components/definitions/DefinitionShell";
import { DefinitionSection } from "../../../components/definitions/DefinitionContent";
import {
  DefinitionFact,
  DefinitionFactList,
} from "../../../components/definitions/DefinitionFacts";
import {
  DefinitionTable,
  DefinitionTableCell,
  DefinitionTableHeadCell,
  DefinitionTableRow,
} from "../../../components/definitions/DefinitionTable";
import ConverterCard from "../../../components/ConverterCard";
import { SITE_URL } from "../../../lib/site";

const canonical = `${SITE_URL}/definitions/timezones/daylight-saving-time`;

export const metadata: Metadata = {
  title: "Daylight saving time definition",
  description:
    "What daylight saving time is, where it is used, how it changes clocks, and why it was established.",
  alternates: { canonical },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Daylight saving time",
  description:
    "A seasonal clock adjustment that moves local civil time forward during part of the year.",
  termCode: "DST",
  url: canonical,
  inDefinedTermSet: {
    "@type": "DefinedTermSet",
    name: "Time zone definitions",
    url: `${SITE_URL}/definitions/timezones`,
  },
};

type DstScheduleRow = {
  region: string;
  starts: string;
  ends: string;
  clocksMove: string;
  notes?: string;
};

const DST_SCHEDULE: DstScheduleRow[] = [
  {
    region: "United States & Canada (most areas)",
    starts: "Second Sunday in March",
    ends: "First Sunday in November",
    clocksMove: "2:00 a.m. local time",
    notes: "Arizona (except the Navajo Nation) and Hawaii do not observe DST.",
  },
  {
    region: "European Union & United Kingdom",
    starts: "Last Sunday in March",
    ends: "Last Sunday in October",
    clocksMove: "1:00 a.m. UTC",
    notes: "The UK period is known as British Summer Time (BST).",
  },
  {
    region: "Australia (NSW, VIC, SA, TAS, ACT)",
    starts: "First Sunday in October",
    ends: "First Sunday in April",
    clocksMove: "2:00 a.m. local time",
    notes: "Queensland, Western Australia, and the Northern Territory do not observe DST.",
  },
  {
    region: "New Zealand",
    starts: "Last Sunday in September",
    ends: "First Sunday in April",
    clocksMove: "2:00 a.m. local time",
  },
  {
    region: "Mexico",
    starts: "Not observed nationwide",
    ends: "Not observed nationwide",
    clocksMove: "—",
    notes: "Nationwide DST ended in 2022; some northern border municipalities still follow the US schedule.",
  },
  {
    region: "Most of Africa and Asia",
    starts: "Not observed",
    ends: "Not observed",
    clocksMove: "—",
    notes: "A few countries, such as Iran and parts of the Middle East, have used their own schedules in some years.",
  },
];

export default function DaylightSavingTimeDefinitionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <DefinitionShell
        backHref="/definitions/timezones"
        backLabel="Time zone definitions"
        name="Daylight saving time"
        secondary="(DST)"
        lead="Daylight saving time is a seasonal clock adjustment in which a region moves its clocks forward, usually by one hour, during part of the year."
      >
        <DefinitionFactList>
          <DefinitionFact label="Common abbreviation" value="DST" />
          <DefinitionFact
            label="Typical adjustment"
            value="One hour forward"
          />
          <DefinitionFact
            label="Purpose"
            value="Shift more daylight into the evening"
          />
          <DefinitionFact
            label="Other names"
            value="Summer time, daylight time"
          />
          <DefinitionFact
            label="Defined by"
            value="Local laws and government rules"
          />
        </DefinitionFactList>

        <DefinitionSection title="What daylight saving time means">
          <p>
            During the daylight saving period, clocks are advanced relative to
            the region&apos;s standard time. When the period ends, clocks are
            moved back to standard time. The exact dates, clock change, and
            even whether the change happens at all are determined by each
            jurisdiction.
          </p>
          <p>
            For example, a location whose standard offset is UTC−05:00 may use
            UTC−04:00 during its daylight time. The underlying relationship to
            UTC changes temporarily; the location&apos;s standard time does not
            change its identity.
          </p>
        </DefinitionSection>

        <DefinitionSection title="When and where it is used">
          <p>
            Daylight saving time is used mainly in parts of North America,
            Europe, Oceania, and the Middle East. It is not used everywhere:
            many countries near the equator have little seasonal variation in
            daylight, and several countries that once used it have since
            stopped.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              In the United States and Canada, many regions advance clocks in
              spring and return to standard time in autumn.
            </li>
            <li>
              In much of Europe, the corresponding period is commonly called
              summer time.
            </li>
            <li>
              Australia and New Zealand use seasonal clock changes in some
              regions, but not uniformly across the whole country.
            </li>
            <li>
              Rules can differ between neighbouring regions, even when they
              use the same standard-time abbreviation.
            </li>
          </ul>
        </DefinitionSection>

        <DefinitionSection title="When regions change their clocks">
          <p>
            The table below summarizes when major regions start and end
            daylight saving time. Exact dates are set by local law and can
            change, so treat this as a general reference rather than an
            authoritative source for a specific year.
          </p>
          <DefinitionTable
            caption="Daylight saving time start and end schedule by region"
            head={
              <>
                <DefinitionTableHeadCell>Region</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>DST starts</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>DST ends</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Clocks move at</DefinitionTableHeadCell>
                <DefinitionTableHeadCell>Notes</DefinitionTableHeadCell>
              </>
            }
          >
            {DST_SCHEDULE.map((row) => (
              <DefinitionTableRow key={row.region}>
                <DefinitionTableCell isHeader>{row.region}</DefinitionTableCell>
                <DefinitionTableCell>{row.starts}</DefinitionTableCell>
                <DefinitionTableCell>{row.ends}</DefinitionTableCell>
                <DefinitionTableCell>{row.clocksMove}</DefinitionTableCell>
                <DefinitionTableCell>{row.notes ?? "—"}</DefinitionTableCell>
              </DefinitionTableRow>
            ))}
          </DefinitionTable>
        </DefinitionSection>

        <DefinitionSection title="Why it was established">
          <p>
            The main argument for seasonal clock changes was to move usable
            daylight from early morning into the evening, when more people
            were expected to be awake, working, shopping, or travelling. The
            policy was also promoted at different times as a way to reduce
            energy use, although the size and direction of that effect depend
            on local habits, climate, and energy systems.
          </p>
        </DefinitionSection>

        <DefinitionSection title="A short history">
          <p>
            The idea of shifting clocks to follow seasonal daylight was
            discussed in the nineteenth century. New Zealand entomologist
            George Hudson proposed a seasonal clock change in 1895, and
            British builder William Willett promoted a similar idea in the
            early twentieth century.
          </p>
          <p>
            Germany introduced a nationwide seasonal clock change in 1916
            during the First World War, partly to conserve fuel and make better
            use of daylight. Other countries adopted, suspended, and
            reintroduced the practice during wartime and later for economic or
            administrative reasons. Modern rules remain matters of national
            and regional legislation.
          </p>
        </DefinitionSection>

        <DefinitionSection title="Related time zone definitions">
          <p>
            The time zone abbreviations below illustrate the difference between
            standard and seasonal labels:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link
                href="/definitions/timezones/EST-eastern"
                className="font-medium text-blue-700 hover:underline dark:text-blue-300"
              >
                Eastern Standard Time
              </Link>{" "}
              is commonly paired with Eastern Daylight Time.
            </li>
            <li>
              <Link
                href="/definitions/timezones/CET"
                className="font-medium text-blue-700 hover:underline dark:text-blue-300"
              >
                Central European Time
              </Link>{" "}
              is commonly paired with Central European Summer Time.
            </li>
            <li>
              <Link
                href="/definitions/timezones/AEST"
                className="font-medium text-blue-700 hover:underline dark:text-blue-300"
              >
                Australian Eastern Standard Time
              </Link>{" "}
              is used as the standard-time reference in eastern Australia.
            </li>
          </ul>
        </DefinitionSection>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Time zone converter
          </h2>
          <ConverterCard
            href="/timezone"
            kind="timezone"
            eyebrow="Time zone"
            title="Time zones"
            subtitle="Convert time between zones and cities"
          />
        </section>
      </DefinitionShell>
    </>
  );
}
