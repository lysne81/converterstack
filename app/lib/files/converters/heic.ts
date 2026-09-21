import { drawableFromBitmap } from "./canvas-image";
import type { Drawable } from "../types";

/**
 * Decode a HEIC/HEIF file.
 *
 * The decoder is a ~1.5 MB WebAssembly bundle, so it is imported lazily and
 * only ever loaded on HEIC conversions. It yields an `ImageBitmap`, which then
 * goes through the same canvas encode path as every other format — that keeps
 * the quality, resize and background options consistent.
 */
export async function decodeHeic(blob: Blob): Promise<Drawable> {
  const { heicTo } = await import("heic-to/next");
  try {
    const bitmap = await heicTo({ blob, type: "bitmap" });
    return drawableFromBitmap(bitmap);
  } catch {
    throw new Error(
      "This file could not be decoded as HEIC. It may be corrupted or use an unsupported codec.",
    );
  }
}
