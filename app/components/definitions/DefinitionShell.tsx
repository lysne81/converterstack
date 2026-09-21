import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared article chrome for a single definition page (a unit, a time zone, or
 * any future kind — currencies, cooking measures, formulas, and so on). Kind
 * layouts (e.g. `UnitDefinitionLayout`, `TimezoneDefinitionLayout`) compose
 * this with `DefinitionFactList`/`DefinitionFact` and `DefinitionSection`/
 * `DefinitionCallout` so every kind shares the same page structure.
 */
export default function DefinitionShell({
  backHref,
  backLabel,
  badge,
  name,
  secondary,
  lead,
  meta,
  children,
}: {
  backHref: string;
  backLabel: string;
  badge?: ReactNode;
  name: ReactNode;
  secondary?: ReactNode;
  lead: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="w-full max-w-2xl">
        <article className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <Link
              href={backHref}
              className="w-fit text-sm text-zinc-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-400"
            >
              ← {backLabel}
            </Link>
            {badge}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {name}
              {secondary && (
                <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                  {secondary}
                </span>
              )}
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {lead}
            </p>
            {meta}
          </header>

          {children}
        </article>
      </main>
    </div>
  );
}
