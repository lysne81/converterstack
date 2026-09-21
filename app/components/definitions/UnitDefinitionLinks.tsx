import Link from "next/link";
import { getPublishedDefinition } from "../../definitions/units/units-definitions";
import type { Unit } from "../../lib/units";

export default function UnitDefinitionLinks({ units }: { units: Unit[] }) {
  const definitions = units
    .map(({ id }) => getPublishedDefinition(id))
    .filter((definition) => definition !== undefined);

  if (definitions.length === 0) return null;

  return (
    <aside
      aria-labelledby="unit-definitions-heading"
      className="flex flex-col gap-3 border-t border-black/[.06] pt-6 dark:border-white/[.08]"
    >
      <h2
        id="unit-definitions-heading"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        About these units
      </h2>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {definitions.map((definition) => (
          <Link
            key={definition.unit.id}
            href={`/definitions/units/${definition.unit.id}`}
            className="font-medium text-blue-700 hover:underline dark:text-blue-300"
          >
            What is {definition.name ?? definition.unit.label}?
          </Link>
        ))}
      </div>
    </aside>
  );
}
