import { detectBrowserName } from "../../browser";
import type { ImageOptions, Drawable } from "../types";

/** A single encoded raster image, before it is given an output file name. */
export type EncodedImage = {
  blob: Blob;
  width: number;
  height: number;
};

/** Targets that cannot store transparency and therefore need a matte colour. */
const OPAQUE_MIMES = new Set(["image/jpeg", "image/bmp"]);

/** Decode any blob the browser understands natively into a drawable image. */
export async function decodeImage(blob: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    try {
      // Honour EXIF orientation explicitly: older engines default to "none",
      // which silently rotates phone photos. Engines that reject the value
      // fall through to the <img> path below, which always applies it.
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "from-image",
      });
      return {
        width: bitmap.width,
        height: bitmap.height,
        source: bitmap,
        close: () => bitmap.close(),
      };
    } catch {
      // Some formats (notably ICO) are only decodable through an <img> element.
    }
  }
  return decodeWithImageElement(blob);
}

/** Decode via an `<img>` element — the fallback path and the only way to read SVG. */
export function decodeWithImageElement(blob: Blob): Promise<Drawable> {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = "sync";

  return new Promise<Drawable>((resolve, reject) => {
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (!width || !height) {
        URL.revokeObjectURL(url);
        reject(new Error("The image has no usable dimensions."));
        return;
      }
      resolve({
        width,
        height,
        source: img,
        close: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be decoded by your browser."));
    };
    img.src = url;
  });
}

/** Wrap an already-decoded bitmap (used by the HEIC engine). */
export function drawableFromBitmap(bitmap: ImageBitmap): Drawable {
  return {
    width: bitmap.width,
    height: bitmap.height,
    source: bitmap,
    close: () => bitmap.close(),
  };
}

function scaledSize(
  width: number,
  height: number,
  maxSize?: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (!maxSize || maxSize <= 0 || longest <= maxSize) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const ratio = maxSize / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas === "function") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function canvasToBlob(
  canvas: AnyCanvas,
  mime: string,
  quality: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: mime, quality });
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("The browser produced no image data.")),
      mime,
      quality,
    );
  });
}

/**
 * Draw a decoded image onto a canvas and encode it as `mime`.
 *
 * Browsers silently fall back to PNG when asked for an unsupported type, so the
 * resulting blob's type is verified rather than trusted.
 */
export async function encodeDrawable(
  drawable: Drawable,
  mime: string,
  options: ImageOptions,
): Promise<EncodedImage> {
  const { width, height } = scaledSize(
    drawable.width,
    drawable.height,
    options.maxSize,
  );

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error(`${detectBrowserName()} blocked canvas rendering.`);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (OPAQUE_MIMES.has(mime)) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(drawable.source, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, mime, options.quality);
  if (blob.type !== mime) {
    throw new Error(`${detectBrowserName()} cannot save ${mime} files.`);
  }
  return { blob, width, height };
}

const encoderSupport = new Map<string, Promise<boolean>>();

/** Feature-detect whether this browser can encode a given image MIME type. */
export function canEncodeMime(mime: string): Promise<boolean> {
  const cached = encoderSupport.get(mime);
  if (cached) return cached;

  const probe = (async () => {
    if (typeof document === "undefined" && typeof OffscreenCanvas !== "function") {
      return false;
    }
    try {
      const canvas = createCanvas(1, 1);
      const blob = await canvasToBlob(canvas, mime, 0.5);
      return blob.type === mime;
    } catch {
      return false;
    }
  })();

  encoderSupport.set(mime, probe);
  return probe;
}
