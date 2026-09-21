import { Suspense } from "react";
import type { Metadata } from "next";
import ConverterSearch from "../components/ConverterSearch";
import ConverterCard from "../components/ConverterCard";
import RecentConverters from "../components/RecentConverters";
import SectionHeading, { FlameIcon } from "../components/SectionHeading";
import RelatedArticles from "../components/articles/RelatedArticles";
import SupportBadge from "../components/SupportBadge";
import FileConverter from "../components/files/FileConverter";
import {
  POPULAR_FILE_SLUGS,
  conversionTitle,
  describeFileConversion,
  fileSlugFor,
  getFileConversionsByKind,
  getPopularFileConversions,
} from "../lib/files/registry";
import { FORMAT_KIND_HEADINGS } from "../lib/files/formats";
import { SITE_URL, OG_IMAGE } from "../lib/site";
import type { FileConversion, FileFormat, FormatKind } from "../lib/files/types";

const CANONICAL = `${SITE_URL}/files`;

const DESCRIPTION =
  "Convert images, audio, video and PDF files — HEIC, PNG, JPG, WEBP, MP3, WAV, FLAC, MP4, MOV, MKV and more — directly in your browser, without uploading anything.";

export const metadata: Metadata = {
  title: "File converter",
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "File converter — no upload, runs in your browser",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary",
    title: "File converter — no upload, runs in your browser",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

/**
 * Questions people actually search before trusting a converter. Rendered both
 * as visible copy and as FAQPage structured data, so the "nothing is uploaded"
 * answer can surface directly in search results.
 */
const FAQ: { question: string; answer: string }[] = [
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. Every conversion runs locally in your browser using your own device's CPU. Your files are never uploaded, never transmitted over the network and never stored on a server.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There is no imposed limit, because nothing is uploaded. The practical ceiling is your device's available memory, so very large video files may be slower on older hardware.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Yes. Once the page has loaded, file conversion keeps working without a network connection, since the conversion happens entirely on your device.",
  },
  {
    question: "Do I need to sign up or install anything?",
    answer:
      "No. There is no sign-up, no account and no software to install. Open the page, pick a file and convert.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, all conversions are free to use, with no watermarks and no daily quota.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "File converter",
  url: CANONICAL,
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern browser with JavaScript enabled.",
  isAccessibleForFree: true,
  permissions: "none",
  storageRequirements: "No server storage — files are processed in memory on your device.",
  featureList: [
    "No file upload required — conversion runs locally in your browser",
    "Files never leave your device",
    "No sign-up or installation",
    "No file size limit imposed by a server",
    "Works offline once the page has loaded",
    "Image, audio, video and PDF conversion",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Convert image, audio, video and PDF files between formats: HEIC, PNG, JPG, WEBP, AVIF, SVG, MP3, WAV, M4A, FLAC, OPUS, MP4, WEBM, MOV, MKV and PDF. Conversion runs locally in the browser, so files are never uploaded.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

/** One-line summary shown under each kind heading. */
const KIND_INTRO: Record<FormatKind, string> = {
  image:
    "Photos, screenshots and graphics — iPhone HEIC, vector SVG, modern AVIF and the everyday PNG, JPG and WEBP.",
  audio:
    "Music, voice memos and recordings — from lossless FLAC and WAV down to compact MP3, M4A and Opus.",
  video:
    "Clips and screen recordings — swap container, re-encode, or pull the soundtrack out as an audio file.",
  document:
    "Turn every page of a PDF into an image you can crop, share or post.",
};

const POPULAR_RANK = new Map<string, number>(
  POPULAR_FILE_SLUGS.map((slug, i) => [slug, i]),
);

function rank(conversion: FileConversion): number {
  return (
    POPULAR_RANK.get(fileSlugFor(conversion.from, conversion.to)) ??
    Number.MAX_SAFE_INTEGER
  );
}

/**
 * Conversions of one kind, bucketed by source format. Both the buckets and the
 * conversions inside them lead with the most searched ones, so the popular
 * jobs sit at the top of every group.
 */
function bySourceFormat(
  conversions: FileConversion[],
): { format: FileFormat; conversions: FileConversion[] }[] {
  const buckets = new Map<string, { format: FileFormat; conversions: FileConversion[] }>();
  for (const conversion of conversions) {
    const bucket = buckets.get(conversion.from.id);
    if (bucket) bucket.conversions.push(conversion);
    else buckets.set(conversion.from.id, { format: conversion.from, conversions: [conversion] });
  }
  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      conversions: [...bucket.conversions].sort((a, b) => rank(a) - rank(b)),
    }))
    .sort((a, b) => rank(a.conversions[0]) - rank(b.conversions[0]));
}

/**
 * The card stays a server component; only the badge is a client component, and
 * it renders nothing until the browser probe resolves. The link is kept live —
 * the dedicated page explains what this browser cannot do and offers
 * alternatives.
 */
function FileCard({ conversion }: { conversion: FileConversion }) {
  return (
    <ConverterCard
      href={`/files/${fileSlugFor(conversion.from, conversion.to)}`}
      kind="file"
      eyebrow="File"
      title={conversionTitle(conversion)}
      subtitle={describeFileConversion(conversion)}
      badge={<SupportBadge conversion={conversion} />}
    />
  );
}

export default function FilesPage() {
  const popular = getPopularFileConversions();
  const groups = getFileConversionsByKind();

  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            File converter
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Convert images, audio, video and PDF files right here in the
            browser. Your files never leave your device.
          </p>
        </div>

        <ConverterSearch />

        <section
          aria-label="File converter"
          className="rounded-2xl bg-white p-5 shadow-sm sm:p-8 dark:bg-zinc-900"
        >
          <Suspense fallback={<div className="h-96" />}>
            <FileConverter />
          </Suspense>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeading icon={<FlameIcon />}>Most used</SectionHeading>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {popular.map((conversion) => (
              <li key={fileSlugFor(conversion.from, conversion.to)}>
                <FileCard conversion={conversion} />
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="File converter groups" className="flex flex-wrap gap-2">
          {groups.map(({ kind }) => (
            <a
              key={kind}
              href={`#${kind}-converters`}
              className="rounded-full bg-black/[.05] px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[.1] dark:bg-white/[.08] dark:text-zinc-400 dark:hover:bg-white/[.14]"
            >
              {FORMAT_KIND_HEADINGS[kind]}
            </a>
          ))}
        </nav>

        {groups.map(({ kind, conversions }) => (
          <section
            key={kind}
            id={`${kind}-converters`}
            className="flex scroll-mt-6 flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <SectionHeading>{FORMAT_KIND_HEADINGS[kind]}</SectionHeading>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {KIND_INTRO[kind]}
              </p>
            </div>
            {bySourceFormat(conversions).map((bucket) => (
              <div key={bucket.format.id} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">
                  {bucket.format.label}{" "}
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    — {bucket.format.name}
                  </span>
                </h3>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {bucket.conversions.map((conversion) => (
                    <li key={fileSlugFor(conversion.from, conversion.to)}>
                      <FileCard conversion={conversion} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}

        <RecentConverters />

        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="flex scroll-mt-6 flex-col gap-4"
        >
          <h2
            id="faq-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Private by design — no upload, no sign-up
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ConverterStack converts files locally, using your own browser. Your
            files are never uploaded to a server, so they stay on your device
            from start to finish.
          </p>
          <dl className="flex flex-col gap-4">
            {FAQ.map(({ question, answer }) => (
              <div key={question} className="flex flex-col gap-1">
                <dt className="text-sm font-semibold">{question}</dt>
                <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                  {answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedArticles route="/files" />
      </main>
    </div>
  );
}
