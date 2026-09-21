import type { Metadata } from "next";
import Link from "next/link";
import DefinitionsSearch, {
  type DefinitionSearchGroup,
} from "../../components/definitions/DefinitionsSearch";
import { CATEGORY_LABELS, type Category } from "../../lib/units";
import { SITE_URL } from "../../lib/site";
import { getPublishedDefinitions } from "./units-definitions";

const publishedDefinitions = getPublishedDefinitions();

export const metadata: Metadata = {
  title: "Unit definitions",
  description:
    "Definitions, symbols, measurement systems, and SI classifications for conversion units.",
  alternates: { canonical: `${SITE_URL}/definitions/units` },
  robots:
    publishedDefinitions.length > 0
      ? { index: true, follow: true }
      : { index: false, follow: true },
};

export default function UnitDefinitionsPage() {
  const groups: DefinitionSearchGroup[] = (
    Object.entries(CATEGORY_LABELS) as [Category, string][]
  )
    .map(([category, label]) => ({
      key: category,
      label,
      items: publishedDefinitions
        .filter((definition) => definition.unit.category === category)
        .map(({ unit, name }) => ({
          id: unit.id,
          href: `/definitions/units/${unit.id}`,
          name: name ?? unit.label,
          symbol: unit.symbol,
        })),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Link
            href="/definitions"
            className="w-fit text-sm text-zinc-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-400"
          >
            ← Definitions
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Unit definitions
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Learn what conversion units mean, where they are used, and how they
            relate to SI.
          </p>
        </header>

        {groups.length > 0 ? (
          <DefinitionsSearch
            groups={groups}
            inputLabel="Search unit definitions"
            emptyLabel="unit definitions"
          />
        ) : (
          <div className="rounded-2xl bg-white p-6 text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
            <p>Reviewed unit definitions are coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
