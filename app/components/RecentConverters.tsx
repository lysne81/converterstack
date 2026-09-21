"use client";

import { useSyncExternalStore } from "react";
import { getRecentSnapshot, subscribeRecent } from "../lib/recent";
import { parseSlug } from "../lib/units";
import { parseFileSlug } from "../lib/files/registry";
import ConverterCard from "./ConverterCard";
import SectionHeading, { HistoryIcon } from "./SectionHeading";

const EMPTY_SERVER: ReturnType<typeof getRecentSnapshot> = [];

export default function RecentConverters() {
  const recent = useSyncExternalStore(
    subscribeRecent,
    getRecentSnapshot,
    () => EMPTY_SERVER,
  );

  if (recent.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading icon={<HistoryIcon />}>Recently used</SectionHeading>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {recent.map((entry) => {
          const pair = parseSlug(entry.slug);
          if (pair) {
            return (
              <li key={entry.slug}>
                <ConverterCard
                  href={`/${entry.slug}`}
                  from={pair.from}
                  to={pair.to}
                />
              </li>
            );
          }
          if (entry.slug.startsWith("files/")) {
            const conversion = parseFileSlug(entry.slug.slice("files/".length));
            if (!conversion) return null;
            return (
              <li key={entry.slug}>
                <ConverterCard
                  href={`/${entry.slug}`}
                  kind="file"
                  eyebrow="File"
                  title={`${entry.fromLabel} → ${entry.toLabel}`}
                  subtitle="Convert files without uploading them"
                />
              </li>
            );
          }
          if (
            entry.slug.startsWith("exchangerate") ||
            entry.slug.startsWith("currency")
          ) {
            // Normalize legacy "currency?..." slugs to the current route.
            const href = `/${entry.slug.replace(/^currency/, "exchangerate")}`;
            return (
              <li key={entry.slug}>
                <ConverterCard
                  href={href}
                  kind="currency"
                  eyebrow="Exchange rates"
                  title={`${entry.fromLabel} → ${entry.toLabel}`}
                  subtitle="Convert money at daily exchange rates"
                />
              </li>
            );
          }
          return (
            <li key={entry.slug}>
              <ConverterCard
                href={`/${entry.slug}`}
                kind="timezone"
                eyebrow="Time zone"
                title={`${entry.fromLabel} → ${entry.toLabel}`}
                subtitle="Convert time between zones and cities"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
