import Link from "next/link";
import type { Metadata } from "next";
import ConverterSearch from "../../components/ConverterSearch";
import RecentConverters from "../../components/RecentConverters";
import SectionHeading from "../../components/SectionHeading";
import RelatedArticles from "../../components/articles/RelatedArticles";
import PdfMerger from "../../components/files/PdfMerger";
import { CategoryIcon, KIND_STYLE } from "../../components/ConverterCard";
import { fileSlugFor, getFileConversions } from "../../lib/files/registry";
import { MERGE_PDF_TOOL } from "../../lib/files/tools";
import { SITE_URL, OG_IMAGE } from "../../lib/site";

const CANONICAL = `${SITE_URL}${MERGE_PDF_TOOL.href}`;
const TITLE = "Merge PDF files";
const DESCRIPTION =
  "Merge PDF files into one document in your browser — free, private and never uploaded. Reorder files, keep text selectable and download a single PDF.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: `${TITLE} — no upload, runs in your browser`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary",
    title: `${TITLE} — no upload, runs in your browser`,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

/**
 * Rendered both as visible copy and as FAQPage structured data, so the
 * "nothing is uploaded" answer can surface directly in search results.
 */
const FAQ: { question: string; answer: string }[] = [
  {
    question: "Are my PDF files uploaded to a server?",
    answer:
      "No. The PDFs are merged locally in your browser using your own device. Your files are never uploaded, never transmitted over the network and never stored on a server.",
  },
  {
    question: "Does merging reduce the quality of my PDFs?",
    answer:
      "No. Pages are copied into the new document as they are, not re-rendered, so text stays sharp and selectable, and links and vector graphics are kept.",
  },
  {
    question: "What if my PDFs have different page sizes?",
    answer:
      "By default every page is scaled to the size of the first page and centred, so the merged document looks consistent. You can also choose A4 or US Letter, or keep each page's original size. Portrait and landscape pages keep their orientation, and scaling is lossless.",
  },
  {
    question: "Can I change the order of the files?",
    answer:
      "Yes. Drag a file to a new position, or use the up and down arrows. Pages are combined from the top of the list to the bottom.",
  },
  {
    question: "Can I merge password-protected PDFs?",
    answer:
      "PDFs that only restrict editing or printing can be merged. PDFs that need a password to open cannot, and are skipped.",
  },
  {
    question: "Is there a limit on file size or number of files?",
    answer:
      "You can merge up to 50 files at a time. There is no size limit imposed by a server, because nothing is uploaded — the practical ceiling is your device's available memory.",
  },
  {
    question: "Is it free?",
    answer: "Yes, merging PDFs is free, with no watermarks, no sign-up and no daily quota.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: TITLE,
  url: CANONICAL,
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern browser with JavaScript enabled.",
  isAccessibleForFree: true,
  permissions: "none",
  storageRequirements:
    "No server storage — files are processed in memory on your device.",
  featureList: [
    "No file upload required — merging runs locally in your browser",
    "Files never leave your device",
    "Reorder files before merging",
    "Pages are copied losslessly — text stays selectable",
    "No sign-up, no watermark",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Combine several PDF files into a single document. Merging runs locally in the browser, so files are never uploaded.",
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

export default function MergePdfPage() {
  const theme = KIND_STYLE.file;
  const pdfConversions = getFileConversions().filter(
    (c) => c.from.id === "pdf" || c.to.id === "pdf",
  );

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
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
            <span className={theme.text}>
              <CategoryIcon kind="file" className="h-6 w-6" />
            </span>
            Merge PDF
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Combine several PDFs into one document, in the order you choose.
            Everything happens on your device — no upload, no sign-up.
          </p>
        </div>

        <ConverterSearch />

        <section
          aria-label="Merge PDF files"
          className="rounded-2xl bg-white p-5 shadow-sm sm:p-8 dark:bg-zinc-900"
        >
          <PdfMerger />
        </section>

        {pdfConversions.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Other PDF tools</SectionHeading>
            <ul className="flex flex-wrap gap-2">
              {pdfConversions.map((c) => (
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

        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="flex scroll-mt-6 flex-col gap-4"
        >
          <h2 id="faq-heading" className="text-lg font-semibold tracking-tight">
            Private by design — no upload, no sign-up
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This PDF merger runs locally, using your own browser. Your files
            are never uploaded to a server, so they stay on your device from
            start to finish.
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

        <RelatedArticles route={MERGE_PDF_TOOL.href} />
      </main>
    </div>
  );
}
