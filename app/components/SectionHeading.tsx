import type { ReactNode } from "react";

const svg = "h-4 w-4 shrink-0";

const common = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  className: svg,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** "Most used" — a flame. */
export function FlameIcon() {
  return (
    <svg {...common}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

/** "Recently used" — a clock with a rewind arrow. */
export function HistoryIcon() {
  return (
    <svg {...common}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export default function SectionHeading({
  icon,
  children,
  className = "",
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 ${className}`}
    >
      {icon}
      {children}
    </h2>
  );
}
