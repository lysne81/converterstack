import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CurrencyDefinitionLayout from "../../../components/definitions/CurrencyDefinitionLayout";
import { SITE_URL } from "../../../lib/site";
import { getStaticCurrencies } from "../../../lib/currency-static";

type Params = { code: string };

export function generateStaticParams(): Params[] {
  return getStaticCurrencies().map(({ code }) => ({ code }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { code } = await params;
  const currency = getStaticCurrencies().find((c) => c.code === code);
  if (!currency) return { title: "Currency definition not found" };

  const canonical = `${SITE_URL}/definitions/currencies/${currency.code}`;

  return {
    title: `${currency.code} — ${currency.name}`,
    description: `${currency.name} (${currency.code}): symbol, type, and the countries that use it.`,
    alternates: { canonical },
  };
}

export default async function CurrencyDefinitionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  const exists = getStaticCurrencies().some((c) => c.code === code);
  if (!exists) notFound();

  return <CurrencyDefinitionLayout code={code} />;
}
