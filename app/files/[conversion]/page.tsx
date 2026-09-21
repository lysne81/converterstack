import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ConverterSearch from "../../components/ConverterSearch";
import RecentConverters from "../../components/RecentConverters";
import SectionHeading from "../../components/SectionHeading";
import RelatedArticles from "../../components/articles/RelatedArticles";
import FileConverter from "../../components/files/FileConverter";
import { CategoryIcon, KIND_STYLE } from "../../components/ConverterCard";
import {
  conversionNotes,
  describeFileConversion,
  fileSlugFor,
  getConversionsFrom,
  getFileConversions,
  parseFileSlug,
} from "../../lib/files/registry";
import type { FileConversion } from "../../lib/files/types";

type Params = { conversion: string };

/**
 * Audio and video jobs can take a while on big files, so they get a promise
 * that does not claim everything is instant.
 */
function isHeavy({ from }: FileConversion): boolean {
  return from.kind === "audio" || from.kind === "video";
}

function privacyLine(conversion: FileConversion): string {
  return isHeavy(conversion)
    ? "Everything runs on your device, so even large files never leave it."
    : "Everything happens on your device — no upload, no waiting, no limits.";
}

export function generateStaticParams(): Params[] {
  return getFileConversions().map((conversion) => ({
    conversion: fileSlugFor(conversion.from, conversion.to),
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { conversion } = await params;
  const parsed = parseFileSlug(conversion);
  if (!parsed) return { title: "File converter" };
  const { from, to } = parsed;
  const title = `Convert ${from.label} to ${to.label}`;
  const promise = isHeavy(parsed)
    ? "free, private and never uploaded"
    : "free, instant and completely private";
  return {
    title,
    description: `${title} in your browser — ${promise}. ${describeFileConversion(parsed)}`,
  };
}

export default async function FileConversionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { conversion } = await params;
  const parsed = parseFileSlug(conversion);
  if (!parsed) notFound();
  const { from, to } = parsed;
  const slug = fileSlugFor(from, to);
  const theme = KIND_STYLE.file;

  const related = getConversionsFrom(from).filter((c) => c.to.id !== to.id);
  const notes = conversionNotes(parsed);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Convert ${from.label} to ${to.label}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: `${describeFileConversion(parsed)} Files are converted locally in your browser and never uploaded.`,
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
              <CategoryIcon kind="file" className="h-6 w-6" />
            </span>
            {from.label} to {to.label}
          </h1>
          <p className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
            {describeFileConversion(parsed)} {privacyLine(parsed)}
          </p>
        </div>

        <ConverterSearch />

        <section
          aria-label={`Convert ${from.label} to ${to.label}`}
          className="flex flex-col gap-8 rounded-2xl bg-white p-5 shadow-sm sm:p-8 dark:bg-zinc-900"
        >
          <FileConverter conversion={parsed} recordRecent />

          <div className="flex flex-col gap-3 border-t border-black/5 pt-6 dark:border-white/10">
            <SectionHeading
              icon={
                <span className={theme.text}>
                  <CategoryIcon kind="file" />
                </span>
              }
            >
              About these formats
            </SectionHeading>
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="font-semibold">
                  {from.label} — {from.name}
                </dt>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  {from.summary}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">
                  {to.label} — {to.name}
                </dt>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  {to.summary}
                </dd>
              </div>
            </dl>
            {notes.length > 0 && (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Other {from.label} conversions</SectionHeading>
            <ul className="flex flex-wrap gap-2">
              {related.map((c) => (
                <li key={fileSlugFor(c.from, c.to)}>
                  <Link
                    href={`/files/${fileSlugFor(c.from, c.to)}`}
                    className="inline-block rounded-full border border-black/10 px-3 py-1.5 text-sm transition-colors hover:bg-black/[.05] dark:border-white/15 dark:hover:bg-white/[.08]"
                  >
                    {c.from.label} to {c.to.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RecentConverters />

        <RelatedArticles route={`/files/${slug}`} />
      </main>
    </div>
  );
}
