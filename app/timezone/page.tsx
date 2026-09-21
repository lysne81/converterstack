import { Suspense } from "react";
import type { Metadata } from "next";
import TimeZoneConverter from "../components/TimeZoneConverter";
import ConverterSearch from "../components/ConverterSearch";
import RecentConverters from "../components/RecentConverters";
import RelatedArticles from "../components/articles/RelatedArticles";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Time zone converter",
  description:
    "Convert the time between any two world time zones (DST-aware).",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Time zone converter",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Convert the time between any two world time zones, adjusted for daylight saving time.",
};

export default function TimeZonePage() {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Time zone converter
          </h1>
          <p className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
            Convert the time of day between any two major world time zones —
            DST-aware.
          </p>
        </div>

        <ConverterSearch />

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8 dark:bg-zinc-900">
          <Suspense fallback={<div className="h-72" />}>
            <TimeZoneConverter />
          </Suspense>
        </section>

        <RecentConverters />

        <Link
          href="/definitions/timezones"
          className="w-fit text-sm text-zinc-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-400"
        >
          Learn about time zone abbreviations
        </Link>

        <RelatedArticles route="/timezone" />
      </main>
    </div>
  );
}
