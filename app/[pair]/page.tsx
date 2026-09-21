import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import PairSelector from "../components/PairSelector";
import ConverterSearch from "../components/ConverterSearch";
import ReferenceTable from "../components/ReferenceTable";
import RecentConverters from "../components/RecentConverters";
import SectionHeading from "../components/SectionHeading";
import RelatedArticles from "../components/articles/RelatedArticles";
import UnitDefinitionLinks from "../components/definitions/UnitDefinitionLinks";
import { CategoryIcon, KIND_STYLE } from "../components/ConverterCard";
import {
  describeConversion,
  getConversionPairs,
  parseSlug,
  slugFor,
} from "../lib/units";
import { SITE_URL, OG_IMAGE } from "../lib/site";

type Params = { pair: string };

export function generateStaticParams(): Params[] {
  return getConversionPairs().map(({ from, to }) => ({
    pair: slugFor(from, to),
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parseSlug(pair);
  if (!parsed) return { title: "Unit Converter" };
  const { from, to } = parsed;
  const title = `Convert ${from.label} to ${to.label}`;
  const description = `${title} (${from.symbol} to ${to.symbol}).`;
  const canonical = `${SITE_URL}/${slugFor(from, to)}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function ConverterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { pair } = await params;
  const parsed = parseSlug(pair);
  if (!parsed) notFound();
  const { from, to } = parsed;
  const theme = KIND_STYLE[from.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Convert ${from.label} to ${to.label}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: `Convert ${from.label} (${from.symbol}) to ${to.label} (${to.symbol}). ${describeConversion(from, to)}`,
  };

  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            <span className={theme.text}>
              <CategoryIcon kind={from.category} className="h-6 w-6" />
            </span>
            {from.label} to {to.label}
          </h1>
          <p className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
            Convert {from.label} ({from.symbol}) to {to.label} ({to.symbol}) —
            live as you type.
          </p>
        </div>

        <ConverterSearch />

        <section className="flex flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <Suspense fallback={<div className="h-80" />}>
            <PairSelector
              initialFromId={from.id}
              initialToId={to.id}
              recordRecent
              lockUnits
            />
          </Suspense>

          <div className="flex flex-col gap-3 border-t border-black/5 pt-6 dark:border-white/10">
            <SectionHeading
              icon={
                <span className={theme.text}>
                  <CategoryIcon kind={from.category} />
                </span>
              }
            >
              Quick reference
            </SectionHeading>
            <ReferenceTable from={from} to={to} />
          </div>

          <Link
            href={`/${slugFor(to, from)}`}
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
          </Link>
        </section>

        <RecentConverters />

        <UnitDefinitionLinks units={[from, to]} />

        <RelatedArticles route={`/${pair}`} />
      </main>
    </div>
  );
}
