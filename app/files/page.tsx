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
import type { FileConversion, FileFormat, FormatKind } from "../lib/files/types";

export const metadata: Metadata = {
  title: "File converter",
  description:
    "Convert images, audio, video and PDF files — HEIC, PNG, JPG, WEBP, MP3, WAV, FLAC, MP4, MOV, MKV and more — directly in your browser, without uploading anything.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "File converter",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Convert image, audio, video and PDF files between formats: HEIC, PNG, JPG, WEBP, AVIF, SVG, MP3, WAV, M4A, FLAC, OPUS, MP4, WEBM, MOV, MKV and PDF. Conversion runs locally in the browser, so files are never uploaded.",
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
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            File converter
          </h1>
          <p className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
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

        <RelatedArticles route="/files" />
      </main>
    </div>
  );
}
