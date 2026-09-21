"use client";

import { useMemo, useState } from "react";
import {
  getConversionPairs,
  slugFor,
  type Category,
} from "../lib/units";
import {
  conversionTitle,
  describeFileConversion,
  fileSlugFor,
  getFileConversionsByKind,
} from "../lib/files/registry";
import { FORMAT_KIND_HEADINGS } from "../lib/files/formats";
import ConverterCard from "./ConverterCard";

type TabValue = Category | "timezone" | "currency" | "file";

const TABS: { value: TabValue; label: string }[] = [
  { value: "length", label: "Length" },
  { value: "mass", label: "Mass" },
  { value: "temperature", label: "Temperature" },
  { value: "area", label: "Area" },
  { value: "volume", label: "Volume" },
  { value: "cooking", label: "Cooking" },
  { value: "speed", label: "Speed" },
  { value: "pressure", label: "Pressure" },
  { value: "energy", label: "Energy" },
  { value: "power", label: "Power" },
  { value: "timezone", label: "Time zones" },
  { value: "currency", label: "Exchange rates" },
  { value: "file", label: "File types" },
];

export default function ConverterBrowser() {
  const pairs = useMemo(() => getConversionPairs(), []);
  const fileGroups = useMemo(() => getFileConversionsByKind(), []);
  const [active, setActive] = useState<TabValue>("length");
  const activeLabel =
    TABS.find((t) => t.value === active)?.label ?? "Converters";

  const visible =
    active === "timezone" || active === "currency" || active === "file"
      ? []
      : pairs.filter((p) => p.from.category === active);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Browse converters
      </h2>

      {/* Filter buttons, not tabs: the control narrows one list of links rather
          than swapping panels, so `aria-pressed` describes it honestly. */}
      <div
        role="group"
        aria-label="Converter categories"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={active === tab.value}
            onClick={() => setActive(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === tab.value
                ? "bg-black/[.08] text-zinc-900 dark:bg-white/[.12] dark:text-white"
                : "bg-black/[.05] text-zinc-600 hover:bg-black/[.1] dark:bg-white/[.08] dark:text-zinc-400 dark:hover:bg-white/[.14]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "file" ? (
        <div
          role="group"
          aria-label={`${activeLabel} converters`}
          tabIndex={0}
          className="flex h-96 flex-col gap-4 overflow-auto"
        >
          {fileGroups.map(({ kind, conversions }) => (
            <div key={kind} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">
                {FORMAT_KIND_HEADINGS[kind]}{" "}
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                  ({conversions.length})
                </span>
              </h3>
              <ul className="grid auto-rows-min grid-cols-2 gap-2 sm:grid-cols-3">
                {conversions.map((conversion) => (
                  <li key={fileSlugFor(conversion.from, conversion.to)}>
                    <ConverterCard
                      href={`/files/${fileSlugFor(conversion.from, conversion.to)}`}
                      kind="file"
                      eyebrow="File"
                      title={conversionTitle(conversion)}
                      subtitle={describeFileConversion(conversion)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul
          aria-label={`${activeLabel} converters`}
          tabIndex={0}
          className="grid h-96 auto-rows-min grid-cols-2 gap-2 overflow-auto sm:grid-cols-3"
        >
          {active === "timezone" && (
            <li>
              <ConverterCard
                href="/timezone"
                kind="timezone"
                eyebrow="Time zone"
                title="Time zones"
                subtitle="Convert time between zones and cities"
              />
            </li>
          )}
          {active === "currency" && (
            <li>
              <ConverterCard
                href="/exchangerate"
                kind="currency"
                eyebrow="Exchange rates"
                title="Exchange rates"
                subtitle="Convert money at daily exchange rates"
              />
            </li>
          )}
          {visible.map(({ from, to }) => (
            <li key={slugFor(from, to)}>
              <ConverterCard href={`/${slugFor(from, to)}`} from={from} to={to} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
