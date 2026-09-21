import Link from "next/link";
import type { ReactNode } from "react";
import {
  CATEGORY_LABELS,
  exampleFor,
  type Category,
  type Unit,
} from "../lib/units";

/** A card "kind" is any unit category plus the standalone special tools. */
export type CardKind = Category | "timezone" | "currency" | "file";

const svg = "h-3.5 w-3.5 shrink-0";

export function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CategoryIcon({
  kind,
  className = svg,
}: {
  kind: CardKind;
  className?: string;
}) {
  const common = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "length":
      return (
        <svg {...common}>
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
          <path d="m14.5 12.5 2-2" />
          <path d="m11.5 9.5 2-2" />
          <path d="m8.5 6.5 2-2" />
          <path d="m17.5 15.5 2-2" />
        </svg>
      );
    case "mass":
      return (
        <svg {...common}>
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
      );
    case "temperature":
      return (
        <svg {...common}>
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
        </svg>
      );
    case "area":
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      );
    case "volume":
      return (
        <svg {...common}>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );
    case "cooking":
      return (
        <svg {...common}>
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      );
    case "speed":
      return (
        <svg {...common}>
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      );
    case "pressure":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6" />
          <path d="m9 11 3 3 3-3" />
        </svg>
      );
    case "energy":
      return (
        <svg {...common}>
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
      );
    case "power":
      return (
        <svg {...common}>
          <path d="M12 2v10" />
          <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
        </svg>
      );
    case "timezone":
      return <ClockIcon className={className} />;
    case "currency":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2A2.5 2.5 0 0 1 9.5 15" />
          <path d="M12 6v1.5M12 16.5V18" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="m9 17 3-3 3 3" />
          <path d="M12 14v5" />
        </svg>
      );
  }
}

export { CategoryIcon };

/** Per-kind accent: icon/eyebrow text color and the left indicator bar. */
export const KIND_STYLE: Record<CardKind, { text: string; bar: string }> = {
  length: { text: "text-sky-600 dark:text-sky-400", bar: "bg-sky-500 dark:bg-sky-400" },
  mass: { text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500 dark:bg-violet-400" },
  temperature: { text: "text-orange-600 dark:text-orange-400", bar: "bg-orange-500 dark:bg-orange-400" },
  area: { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500 dark:bg-emerald-400" },
  volume: { text: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500 dark:bg-cyan-400" },
  cooking: { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500 dark:bg-amber-400" },
  speed: { text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500 dark:bg-rose-400" },
  pressure: { text: "text-teal-600 dark:text-teal-400", bar: "bg-teal-500 dark:bg-teal-400" },
  energy: { text: "text-yellow-600 dark:text-yellow-400", bar: "bg-yellow-500 dark:bg-yellow-400" },
  power: { text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500 dark:bg-indigo-400" },
  timezone: { text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500 dark:bg-blue-400" },
  currency: { text: "text-green-600 dark:text-green-400", bar: "bg-green-500 dark:bg-green-400" },
  file: { text: "text-fuchsia-600 dark:text-fuchsia-400", bar: "bg-fuchsia-500 dark:bg-fuchsia-400" },
};

type CommonProps = {
  href: string;
  active?: boolean;
  onMouseEnter?: () => void;
  /**
   * Optional slot on the eyebrow row, used by file cards to flag conversions
   * this browser cannot run. Pass a client component so the badge only appears
   * once capability probing has resolved — the card itself stays server-rendered.
   */
  badge?: ReactNode;
};

type Props = CommonProps &
  (
    | { from: Unit; to: Unit }
    | { kind: CardKind; eyebrow: string; title: ReactNode; subtitle: ReactNode }
  );

export default function ConverterCard(props: Props) {
  const { href, active = false, onMouseEnter, badge } = props;
  const isPair = "from" in props;

  const kind: CardKind = isPair ? props.from.category : props.kind;
  const eyebrow = isPair ? CATEGORY_LABELS[props.from.category] : props.eyebrow;
  const subtitle = isPair ? exampleFor(props.from, props.to) : props.subtitle;
  const style = KIND_STYLE[kind];

  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      className={`relative flex h-full flex-col overflow-hidden rounded-lg border py-2.5 pl-4 pr-3 shadow-sm transition-colors ${
        active
          ? "border-transparent bg-black/[.06] shadow-md dark:bg-white/[.1]"
          : "border-black/10 bg-black/[.02] hover:border-transparent hover:bg-black/[.06] hover:shadow-md dark:border-white/15 dark:bg-white/[.03] dark:hover:bg-white/[.1]"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] ${style.bar}`}
      />
      <span
        className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${style.text}`}
      >
        <CategoryIcon kind={kind} />
        {eyebrow}
        {badge}
      </span>

      {isPair ? (
        <span className="mt-0.5 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            {props.from.label}
          </span>
          <span className={`mx-1 ${style.text}`} aria-hidden>
            →
          </span>
          <span className="font-semibold">{props.to.label}</span>
        </span>
      ) : (
        <span className="mt-0.5 text-sm font-medium">{props.title}</span>
      )}

      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </span>
    </Link>
  );
}
