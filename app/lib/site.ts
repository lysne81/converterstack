export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://converterstack.com"
).replace(/\/$/, "");

/**
 * Shared social card image. Next.js replaces the whole `openGraph` object when
 * a page declares its own, so every page that sets `openGraph` has to spread
 * this in explicitly rather than relying on inheritance from the root layout.
 */
export const OG_IMAGE = {
  url: "/icon-light.jpg",
  width: 769,
  height: 743,
  alt: "ConverterStack",
};
