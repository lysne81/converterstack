import { decodeWithImageElement } from "./canvas-image";
import type { Drawable } from "../types";

/** Longest edge used when an SVG declares neither a size nor a viewBox. */
export const DEFAULT_SVG_SIZE = 1024;

/** CSS absolute units expressed in pixels at the reference 96 DPI. */
const UNIT_PX: Record<string, number> = {
  "": 1,
  px: 1,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 25.4 / 4,
  pt: 96 / 72,
  pc: 16,
};

function parseLength(value: string | null): number {
  if (!value) return 0;
  const match = /^\s*([0-9]*\.?[0-9]+)\s*([a-z]*)\s*$/i.exec(value);
  if (!match) return 0;
  const unit = UNIT_PX[match[2].toLowerCase()];
  if (!unit) return 0;
  return Number.parseFloat(match[1]) * unit;
}

/**
 * The intrinsic pixel size of an SVG: explicit width/height first, then the
 * viewBox, and finally a square fallback.
 */
function intrinsicSize(svg: SVGSVGElement): { width: number; height: number } {
  const width = parseLength(svg.getAttribute("width"));
  const height = parseLength(svg.getAttribute("height"));
  if (width > 0 && height > 0) return { width, height };

  const viewBox = svg.getAttribute("viewBox")?.trim().split(/[\s,]+/);
  if (viewBox?.length === 4) {
    const vbWidth = Number.parseFloat(viewBox[2]);
    const vbHeight = Number.parseFloat(viewBox[3]);
    if (vbWidth > 0 && vbHeight > 0) {
      if (width > 0) return { width, height: (width / vbWidth) * vbHeight };
      if (height > 0) return { width: (height / vbHeight) * vbWidth, height };
      return { width: vbWidth, height: vbHeight };
    }
  }

  return { width: DEFAULT_SVG_SIZE, height: DEFAULT_SVG_SIZE };
}

/**
 * Rasterise an SVG.
 *
 * The document is re-serialised with explicit pixel dimensions so it renders at
 * the requested size instead of the browser's 300×150 default, and so that
 * resizing happens in vector space (crisp) rather than by scaling pixels.
 */
export async function decodeSvg(
  blob: Blob,
  targetSize?: number,
): Promise<Drawable> {
  const text = await blob.text();
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.documentElement as unknown as SVGSVGElement;

  if (!svg || svg.nodeName.toLowerCase() !== "svg") {
    throw new Error("This file is not a valid SVG document.");
  }
  if (doc.querySelector("parsererror")) {
    throw new Error("This SVG file could not be parsed.");
  }

  const { width, height } = intrinsicSize(svg);

  // Keep the drawing area addressable after we overwrite width/height.
  if (!svg.getAttribute("viewBox")) {
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const longest = Math.max(width, height);
  const scale = targetSize && targetSize > 0 ? targetSize / longest : 1;
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));

  svg.setAttribute("width", String(outWidth));
  svg.setAttribute("height", String(outHeight));

  const serialized = new XMLSerializer().serializeToString(svg);
  const sized = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });

  return decodeWithImageElement(sized);
}
