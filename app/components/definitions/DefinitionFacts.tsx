import type { ReactNode } from "react";

/** Shared `<dl>` wrapper for the fact list on a definition page. */
export function DefinitionFactList({ children }: { children: ReactNode }) {
  return (
    <dl className="rounded-2xl bg-white px-5 shadow-sm dark:bg-zinc-900">
      {children}
    </dl>
  );
}

/** A single label/value row. Renders nothing when `value` is falsy. */
export function DefinitionFact({
  label,
  value,
}: {
  label: string;
  value: ReactNode | undefined;
}) {
  if (!value) return null;

  return (
    <div className="grid gap-1 border-b border-black/[.06] py-3 last:border-0 sm:grid-cols-[10rem_1fr] dark:border-white/[.08]">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
