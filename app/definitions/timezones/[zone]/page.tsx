import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TimezoneDefinitionLayout from "../../../components/definitions/TimezoneDefinitionLayout";
import { SITE_URL } from "../../../lib/site";
import {
  getTimezoneDefinition,
  getTimezoneDefinitions,
} from "../timezones-definitions";

type Params = { zone: string };

export function generateStaticParams(): Params[] {
  return getTimezoneDefinitions().map(({ slug }) => ({ zone: slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { zone } = await params;
  const definition = getTimezoneDefinition(zone);
  if (!definition) return { title: "Time zone definition not found" };

  const canonical = `${SITE_URL}/definitions/timezones/${definition.slug}`;

  return {
    title: `${definition.abbrev} — ${definition.name}`,
    description: definition.description,
    alternates: { canonical },
  };
}

export default async function TimezoneDefinitionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { zone } = await params;
  const definition = getTimezoneDefinition(zone);
  if (!definition) notFound();

  return <TimezoneDefinitionLayout definition={definition} />;
}
