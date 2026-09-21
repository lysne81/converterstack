import Link from "next/link";
import type { Metadata } from "next";
import ConverterBrowser from "../components/ConverterBrowser";
import ConverterSearch from "../components/ConverterSearch";

export const metadata: Metadata = {
  title: "Browse all converters",
  description: "Browse every available unit converter by category.",
};

export default function BrowsePage() {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            All converters
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse every converter by category.
          </p>
        </header>

        <ConverterSearch />

        <ConverterBrowser />
      </main>
    </div>
  );
}
