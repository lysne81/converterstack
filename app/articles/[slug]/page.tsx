import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "../../components/articles/ArticleLayout";
import { SITE_URL } from "../../lib/site";
import { getAllArticles, getArticle } from "../articles";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllArticles().map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };

  const canonical = `${SITE_URL}/articles/${article.slug}`;
  const isPublished = article.status === "published";

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd =
    article.status === "published"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt ?? article.publishedAt,
          mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
          author: {
            "@type": "Organization",
            name: "ConverterStack",
            url: SITE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: "ConverterStack",
            url: SITE_URL,
          },
        }
      : null;

  const faqJsonLd =
    article.status === "published" && article.faq && article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  const howToJsonLd =
    article.status === "published" && article.howTo
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: article.howTo.name,
          step: article.howTo.steps.map((step) => ({
            "@type": "HowToStep",
            name: step.name,
            text: step.text,
          })),
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ArticleLayout article={article}>{article.content}</ArticleLayout>
    </>
  );
}
