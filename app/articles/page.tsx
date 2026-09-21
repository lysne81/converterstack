import type { Metadata } from "next";
import Link from "next/link";
import {
  ARTICLE_CATEGORY_LABELS,
  getPublishedArticles,
  type ArticleCategory,
  type ArticleDefinition,
} from "./articles";

const publishedArticles = getPublishedArticles();

const CATEGORY_ORDER: ArticleCategory[] = [
  "measurement-systems",
  "temperature",
  "mass-weight",
  "cooking",
  "area",
  "power",
  "energy",
  "pressure",
  "speed",
  "time",
  "general",
];

function groupByCategory(
  articles: ArticleDefinition[],
): { category: ArticleCategory; articles: ArticleDefinition[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    articles: articles.filter((article) => article.category === category),
  })).filter((group) => group.articles.length > 0);
}

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Practical guides to unit conversions, exchange rates, and time zones.",
  robots:
    publishedArticles.length > 0
      ? { index: true, follow: true }
      : { index: false, follow: true },
};

export default function ArticlesPage() {
  const groups = groupByCategory(publishedArticles);

  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Articles</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Practical guides for understanding units and making accurate
            conversions.
          </p>
        </header>

        {groups.length > 0 ? (
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <section
                key={group.category}
                aria-labelledby={`category-${group.category}`}
                className="flex flex-col gap-4"
              >
                <h2
                  id={`category-${group.category}`}
                  className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                >
                  {ARTICLE_CATEGORY_LABELS[group.category]}
                </h2>
                <ul className="flex flex-col gap-4">
                  {group.articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="block rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-900"
                      >
                        <h3 className="text-lg font-semibold">
                          {article.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {article.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
            <p>New conversion guides are coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
