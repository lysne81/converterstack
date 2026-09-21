import Link from "next/link";
import type { ReactNode } from "react";

export function ArticleSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}

export function ArticleSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function ArticleCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <p className="font-semibold text-blue-950 dark:text-blue-100">{title}</p>
      <div className="mt-1 text-sm text-blue-900 dark:text-blue-200">
        {children}
      </div>
    </aside>
  );
}

export function ConverterLink({
  href,
  title,
  description,
}: {
  href: `/${string}`;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-black/[.08] p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/[.1] dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
    >
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </span>
      <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </span>
    </Link>
  );
}

export type ArticleFaqItem = {
  question: string;
  answer: string;
};

/**
 * Visible FAQ block. Pairs with the `FAQPage` JSON-LD emitted in
 * `app/articles/[slug]/page.tsx` from the same `faq` data, so the rendered
 * content and the structured data always match (a requirement for FAQPage
 * rich results).
 */
export function ArticleFAQ({ items }: { items: ArticleFaqItem[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">
        Frequently asked questions
      </h2>
      <dl className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col gap-1">
            <dt className="font-semibold text-zinc-900 dark:text-zinc-100">
              {item.question}
            </dt>
            <dd className="text-zinc-700 dark:text-zinc-300">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
