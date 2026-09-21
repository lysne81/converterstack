import { Suspense } from "react";
import HomeConverter from "./components/HomeConverter";
import PopularConverters from "./components/PopularConverters";
import RecentConverters from "./components/RecentConverters";
import ConverterSearch from "./components/ConverterSearch";

export default function Home() {
  return (
    <div className="app-bg flex flex-1 items-start justify-center px-6 pb-16 pt-6">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <p className="hidden text-zinc-600 sm:block dark:text-zinc-400">
          Fast, live conversions for units, exchange rates, time zones and
          more.
        </p>

        <ConverterSearch />

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <Suspense fallback={<div className="h-80" />}>
            <HomeConverter />
          </Suspense>
        </section>

        <RecentConverters />

        <PopularConverters />
      </main>
    </div>
  );
}
