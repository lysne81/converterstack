"use client";

import { useEffect, useState } from "react";

export default function CopyButton({
  value,
  label = "Copy value",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="relative shrink-0">
      {copied && (
        <span
          aria-hidden
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white shadow-md after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:after:border-t-zinc-100"
        >
          Copied!
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : label}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
          copied
            ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
            : "border-black/10 text-zinc-600 hover:bg-black/[.04] dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
        }`}
      >
        {copied ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </button>
    </div>
  );
}
