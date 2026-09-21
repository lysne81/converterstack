import Link from "next/link";
import { getPublishedArticlesForRoute } from "../../articles/articles";

export default function RelatedArticles({ route }: { route: string }) {
  const articles = getPublishedArticlesForRoute(route);
  if (articles.length === 0) return null;

  return (
    <aside
      aria-labelledby="related-articles-heading"
      className="flex flex-col gap-3 border-t border-black/[.06] pt-6 dark:border-white/[.08]"
    >
      <h2
        id="related-articles-heading"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Related guides
      </h2>
      <ul className="flex flex-col gap-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="group block rounded-xl border border-black/[.06] px-4 py-3 hover:border-blue-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/[.08] dark:hover:border-blue-900 dark:hover:bg-zinc-900"
            >
              <span className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                {article.title}
              </span>
              <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">
                {article.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
