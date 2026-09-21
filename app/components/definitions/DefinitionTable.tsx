import type { ReactNode } from "react";

/**
 * Shared table wrapper for definition pages, styled to match
 * `DefinitionFactList`. Scrolls horizontally on narrow screens instead of
 * squeezing columns.
 */
export function DefinitionTable({
  caption,
  head,
  children,
}: {
  /** Visually hidden but read by screen readers; also helps SEO/GEO context. */
  caption: string;
  head: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-black/[.06] dark:border-white/[.08]">
            {head}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function DefinitionTableHeadCell({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400"
    >
      {children}
    </th>
  );
}

export function DefinitionTableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-black/[.06] last:border-0 dark:border-white/[.08]">
      {children}
    </tr>
  );
}

export function DefinitionTableCell({
  children,
  isHeader,
}: {
  children: ReactNode;
  isHeader?: boolean;
}) {
  if (isHeader) {
    return (
      <th
        scope="row"
        className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100"
      >
        {children}
      </th>
    );
  }
  return <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{children}</td>;
}
