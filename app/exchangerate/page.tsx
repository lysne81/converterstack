import { Suspense } from "react";
import type { Metadata } from "next";
import CurrencyConverter from "../components/CurrencyConverter";
import ConverterSearch from "../components/ConverterSearch";
import RecentConverters from "../components/RecentConverters";
import RelatedArticles from "../components/articles/RelatedArticles";
import { SITE_URL, OG_IMAGE } from "../lib/site";

const CANONICAL = `${SITE_URL}/exchangerate`;
const DESCRIPTION =
  "Convert between world currencies using daily exchange rates.";

export const metadata: Metadata = {
  title: "Exchange rates converter",
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "Exchange rates converter",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary",
    title: "Exchange rates converter",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Exchange rates converter",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Convert between world currencies using daily reference exchange rates.",
};

export default function CurrencyPage() {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Exchange rates converter
          </h1>
          <p className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
            Convert between major world currencies using daily European Central
            Bank reference rates.
          </p>
        </div>

        <ConverterSearch />

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8 dark:bg-zinc-900">
          <Suspense fallback={<div className="h-72" />}>
            <CurrencyConverter />
          </Suspense>
        </section>

        <RecentConverters />

        <RelatedArticles route="/exchangerate" />
      </main>
    </div>
  );
}
