import type { MetadataRoute } from "next";
import { getPublishedArticles } from "./articles/articles";
import { getPublishedDefinitions } from "./definitions/units/units-definitions";
import { getTimezoneDefinitions } from "./definitions/timezones/timezones-definitions";
import { getStaticCurrencies } from "./lib/currency-static";
import { SITE_URL } from "./lib/site";
import { getConversionPairs, slugFor } from "./lib/units";
import { fileSlugFor, getFileConversions } from "./lib/files/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/browse`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/timezone`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/exchangerate`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/files`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/licenses`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const converterRoutes: MetadataRoute.Sitemap = getConversionPairs().map(
    ({ from, to }) => ({
      url: `${SITE_URL}/${slugFor(from, to)}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  const fileRoutes: MetadataRoute.Sitemap = getFileConversions().map(
    ({ from, to }) => ({
      url: `${SITE_URL}/files/${fileSlugFor(from, to)}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  const publishedArticles = getPublishedArticles();
  const articleRoutes: MetadataRoute.Sitemap = publishedArticles.map(
    (article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  if (publishedArticles.length > 0) {
    articleRoutes.unshift({
      url: `${SITE_URL}/articles`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  const publishedDefinitions = getPublishedDefinitions();
  const definitionRoutes: MetadataRoute.Sitemap = publishedDefinitions.map(
    (definition) => ({
      url: `${SITE_URL}/definitions/units/${definition.unit.id}`,
      lastModified: new Date(definition.reviewedAt!),
      changeFrequency: "yearly",
      priority: 0.5,
    }),
  );

  if (publishedDefinitions.length > 0) {
    definitionRoutes.unshift({
      url: `${SITE_URL}/definitions/units`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  const timezoneDefinitions = getTimezoneDefinitions();
  const timezoneDefinitionRoutes: MetadataRoute.Sitemap = timezoneDefinitions.map(
    ({ slug }) => ({
      url: `${SITE_URL}/definitions/timezones/${slug}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    }),
  );

  timezoneDefinitionRoutes.unshift({
    url: `${SITE_URL}/definitions/timezones`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.4,
  });
  timezoneDefinitionRoutes.push({
    url: `${SITE_URL}/definitions/timezones/daylight-saving-time`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.4,
  });

  const definitionsHubRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/definitions`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const currencyDefinitions = getStaticCurrencies();
  const currencyDefinitionRoutes: MetadataRoute.Sitemap = currencyDefinitions.map(
    (currency) => ({
      url: `${SITE_URL}/definitions/currencies/${currency.code}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    }),
  );

  if (currencyDefinitionRoutes.length > 0) {
    currencyDefinitionRoutes.unshift({
      url: `${SITE_URL}/definitions/currencies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return [
    ...staticRoutes,
    ...converterRoutes,
    ...fileRoutes,
    ...articleRoutes,
    ...definitionsHubRoute,
    ...definitionRoutes,
    ...timezoneDefinitionRoutes,
    ...currencyDefinitionRoutes,
  ];
}
