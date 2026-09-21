import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnitDefinitionLayout from "../../../components/definitions/UnitDefinitionLayout";
import { SITE_URL, OG_IMAGE } from "../../../lib/site";
import {
  getAllDefinitions,
  getDefinition,
} from "../units-definitions";

type Params = { unit_id: string };

export function generateStaticParams(): Params[] {
  return getAllDefinitions().map(({ unit }) => ({ unit_id: unit.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { unit_id: unitId } = await params;
  const definition = getDefinition(unitId);
  if (!definition) return { title: "Unit definition not found" };

  const name = definition.name ?? definition.unit.label;
  const description =
    definition.definition ??
    `Draft definition for ${definition.unit.label} (${definition.unit.symbol}).`;
  const canonical = `${SITE_URL}/definitions/units/${definition.unit.id}`;
  const isPublished = definition.status === "published";

  return {
    title: `${name} (${definition.unit.symbol}) definition`,
    description,
    alternates: { canonical },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${name} (${definition.unit.symbol})`,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function UnitDefinitionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { unit_id: unitId } = await params;
  const definition = getDefinition(unitId);
  if (!definition) notFound();

  const jsonLd =
    definition.status === "published"
      ? {
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: definition.name,
          description: definition.definition,
          termCode: definition.unit.symbol,
          url: `${SITE_URL}/definitions/units/${definition.unit.id}`,
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `${definition.quantity} units`,
            url: `${SITE_URL}/definitions/units`,
          },
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Measurement system",
              value: definition.measurementSystem,
            },
            {
              "@type": "PropertyValue",
              name: "SI classification",
              value: definition.siClassification,
            },
          ],
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <UnitDefinitionLayout definition={definition}>
        {definition.content}
      </UnitDefinitionLayout>
    </>
  );
}
