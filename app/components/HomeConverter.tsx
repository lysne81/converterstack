"use client";

import { useState } from "react";
import PairSelector from "./PairSelector";
import CurrencyConverter from "./CurrencyConverter";
import TimeZoneConverter from "./TimeZoneConverter";
import FileConverter from "./files/FileConverter";

type Mode = "units" | "currency" | "timezone" | "file";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors sm:h-auto sm:flex-none sm:py-1.5 ${
        active
          ? "bg-black/[.08] text-zinc-900 dark:bg-white/[.12] dark:text-white"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** A tab label that shortens on mobile and expands on `sm+`. */
function TabLabel({ short, full }: { short: string; full: string }) {
  if (short === full) return <>{full}</>;
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  );
}

export default function HomeConverter() {
  const [mode, setMode] = useState<Mode>("units");

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="Converter type"
        className="flex w-full rounded-full border border-black/10 p-1 sm:inline-flex sm:w-auto sm:self-start dark:border-white/15"
      >
        <TabButton active={mode === "units"} onClick={() => setMode("units")}>
          <TabLabel short="Units" full="Units" />
        </TabButton>
        <TabButton
          active={mode === "currency"}
          onClick={() => setMode("currency")}
        >
          <TabLabel short="Rates" full="Exchange rates" />
        </TabButton>
        <TabButton
          active={mode === "timezone"}
          onClick={() => setMode("timezone")}
        >
          <TabLabel short="Zones" full="Time zones" />
        </TabButton>
        <TabButton active={mode === "file"} onClick={() => setMode("file")}>
          <TabLabel short="Files" full="Files" />
        </TabButton>
      </div>

      {mode === "units" && <PairSelector />}
      {mode === "currency" && <CurrencyConverter recordRecent={false} />}
      {mode === "timezone" && <TimeZoneConverter recordRecent={false} />}
      {mode === "file" && <FileConverter />}
    </div>
  );
}
