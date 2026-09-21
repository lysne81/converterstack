import type { ReactNode } from "react";

export function DefinitionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}

export function DefinitionCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <p className="font-semibold text-blue-950 dark:text-blue-100">{title}</p>
      <div className="mt-1 text-sm text-blue-900 dark:text-blue-200">
        {children}
      </div>
    </aside>
  );
}
