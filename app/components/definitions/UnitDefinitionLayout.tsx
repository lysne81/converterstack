import type { ReactNode } from "react";
import type { UnitDefinition } from "../../definitions/units/units-definitions";
import { getConversionPairs, slugFor } from "../../lib/units";
import ConverterCard from "../ConverterCard";
import DefinitionShell from "./DefinitionShell";
import { DefinitionFact, DefinitionFactList } from "./DefinitionFacts";
import UnitFigure from "./UnitFigure";

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default function UnitDefinitionLayout({
  definition,
  children,
}: {
  definition: UnitDefinition;
  children?: ReactNode;
}) {
  const { unit } = definition;
  const converters = getConversionPairs()
    .filter(({ from }) => from.id === unit.id)
    .slice(0, 6);

  return (
    <DefinitionShell
      backHref="/definitions/units"
      backLabel="Unit definitions"
      badge={
        definition.status === "draft" && (
          <p className="w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Draft preview
          </p>
        )
      }
      name={definition.name ?? unit.label}
      secondary={`(${unit.symbol})`}
      lead={
        definition.definition ??
        `Definition content for ${unit.label.toLowerCase()} is being prepared.`
      }
      meta={
        definition.reviewedAt && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Reviewed{" "}
            <time dateTime={definition.reviewedAt}>
              {DATE_FORMATTER.format(
                new Date(`${definition.reviewedAt}T00:00:00Z`),
              )}
            </time>
          </p>
        )
      }
    >
      <DefinitionFactList>
        <DefinitionFact label="Symbol" value={unit.symbol} />
        <DefinitionFact label="Quantity" value={definition.quantity} />
        <DefinitionFact
          label="Measurement system"
          value={definition.measurementSystem}
        />
        <DefinitionFact
          label="SI classification"
          value={definition.siClassification}
        />
        <DefinitionFact label="Reference unit" value={definition.referenceUnit} />
        <DefinitionFact
          label="Exact relationship"
          value={definition.exactRelationship}
        />
      </DefinitionFactList>

      <UnitFigure unit={unit} name={definition.name ?? unit.label} />

      {definition.status === "draft" && (
        <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          This preview is not published or included in search discovery. Add
          reviewed content and sources before changing its status.
        </aside>
      )}

      {children && (
        <div className="flex flex-col gap-8 leading-7">{children}</div>
      )}

      {converters.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Convert {definition.name ?? unit.label}
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {converters.map(({ from, to }) => (
              <li key={slugFor(from, to)}>
                <ConverterCard
                  href={`/${slugFor(from, to)}`}
                  from={from}
                  to={to}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </DefinitionShell>
  );
}
