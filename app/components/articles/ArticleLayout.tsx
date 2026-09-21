import Link from "next/link";
import type { ReactNode } from "react";
import { getRelatedArticles, type ArticleDefinition } from "../../articles/articles";
import RelatedGuides from "./RelatedGuides";

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function ArticleDate({ date }: { date: string }) {
  return (
    <time dateTime={date}>
      {DATE_FORMATTER.format(new Date(`${date}T00:00:00Z`))}
    </time>
  );
}

export default function ArticleLayout({
  article,
  children,
}: {
  article: ArticleDefinition;
  children: ReactNode;
}) {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="w-full max-w-2xl">
        <article className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <Link
              href="/articles"
              className="w-fit text-sm text-zinc-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-400"
            >
              ← Articles
            </Link>
            {article.status === "draft" && (
              <p className="w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                Draft preview
              </p>
            )}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {article.title}
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {article.description}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Published <ArticleDate date={article.publishedAt} />
              {article.updatedAt && (
                <>
                  {" · Updated "}
                  <ArticleDate date={article.updatedAt} />
                </>
              )}
            </p>
          </header>

          <div className="flex flex-col gap-8 leading-7">{children}</div>

          <RelatedGuides articles={getRelatedArticles(article.slug)} />
        </article>
      </main>
    </div>
  );
}
