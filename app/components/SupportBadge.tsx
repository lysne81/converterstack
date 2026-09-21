"use client";

import { useEffect, useRef, useState } from "react";

import { useConversionSupport } from "../lib/files/support";
import type { FileConversion } from "../lib/files/types";

function Flag({ conversion }: { conversion: FileConversion }) {
  const support = useConversionSupport(conversion);
  if (support.state !== "unsupported") return null;

  return (
    <span
      title={support.reason}
      className="ml-auto rounded-sm border border-amber-600/40 bg-amber-500/10 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-400/40 dark:text-amber-200"
    >
      Not supported here
      {/* The `title` tooltip is mouse-only, so the reason is repeated for
          screen-reader and keyboard users. */}
      <span className="sr-only">: {support.reason}</span>
    </span>
  );
}

/**
 * Small "Not supported here" flag for file-conversion cards. Pass it to
 * `ConverterCard`'s `badge` slot.
 *
 * Probing is deferred until the card approaches the viewport: the audio and
 * video probes pull in the media library, and the hub lists close to a hundred
 * conversions, so probing them all on load would download it for visitors who
 * only ever look at the image section. Nothing is rendered until a probe
 * resolves, so the static HTML and the first client render always match.
 */
export default function SupportBadge({
  conversion,
}: {
  conversion: FileConversion;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = anchor.current;
    if (!node) return;

    if (typeof IntersectionObserver !== "function") {
      const timer = setTimeout(() => setNear(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setNear(true);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!near) return <span ref={anchor} aria-hidden="true" />;
  return <Flag conversion={conversion} />;
}
