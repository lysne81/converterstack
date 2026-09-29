import { decodeImage, encodeDrawable } from "./canvas-image";
import { decodeHeic } from "./heic";
import { outputFileName } from "../formats";
import type { ConvertRequest, ConvertResult, Drawable, PageSizeId } from "../types";

/** Page geometry in PDF points (1/72 inch). */
const PAGE_SIZES: Record<Exclude<PageSizeId, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

/** Uniform margin used by the fixed page sizes, half an inch. */
const MARGIN = 36;

async function decodeSource(request: ConvertRequest): Promise<Drawable> {
  if (request.conversion.from.id === "heic") return decodeHeic(request.file);
  return decodeImage(request.file);
}

/**
 * pdf-lib can only embed JPEG and PNG, so every other source is re-encoded
 * first. The canvas round-trip also applies the quality and max-size options,
 * which keeps a 12-megapixel phone photo from becoming a 40 MB PDF.
 */
async function embeddableImage(
  request: ConvertRequest,
): Promise<{ bytes: Uint8Array; mime: string; width: number; height: number }> {
  const { from } = request.conversion;
  // Alpha would be lost by JPEG, so transparent sources go through PNG.
  const mime = from.alpha ? "image/png" : "image/jpeg";

  const drawable = await decodeSource(request);
  try {
    const encoded = await encodeDrawable(drawable, mime, request.options.image);
    const bytes = new Uint8Array(await encoded.blob.arrayBuffer());
    return { bytes, mime, width: encoded.width, height: encoded.height };
  } finally {
    drawable.close();
  }
}

/** Where to draw the image on a fixed-size page: centred, scaled down to fit. */
function placeOnPage(
  pageWidth: number,
  pageHeight: number,
  imageWidth: number,
  imageHeight: number,
): { x: number; y: number; width: number; height: number } {
  const scale = Math.min(
    1,
    (pageWidth - MARGIN * 2) / imageWidth,
    (pageHeight - MARGIN * 2) / imageHeight,
  );
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  };
}

/** Wrap a single image in a one-page PDF. */
export async function buildPdfFromImage(
  request: ConvertRequest,
): Promise<ConvertResult> {
  const { PDFDocument } = await import("@cantoo/pdf-lib");

  const image = await embeddableImage(request);
  const pdfDocument = await PDFDocument.create();
  const embedded =
    image.mime === "image/png"
      ? await pdfDocument.embedPng(image.bytes)
      : await pdfDocument.embedJpg(image.bytes);

  const pageSize = request.options.document.pageSize;
  if (pageSize === "fit") {
    // One point per pixel: the page is exactly the image, with no margins.
    const page = pdfDocument.addPage([image.width, image.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  } else {
    const [shortSide, longSide] = PAGE_SIZES[pageSize];
    const landscape = image.width > image.height;
    const pageWidth = landscape ? longSide : shortSide;
    const pageHeight = landscape ? shortSide : longSide;
    const page = pdfDocument.addPage([pageWidth, pageHeight]);
    page.drawImage(
      embedded,
      placeOnPage(pageWidth, pageHeight, image.width, image.height),
    );
  }

  const [page] = pdfDocument.getPages();
  const { width, height } = page.getSize();
  const bytes = await pdfDocument.save();
  const blob = new Blob([bytes], { type: "application/pdf" });

  request.onProgress?.(1);
  return {
    outputs: [
      {
        blob,
        name: outputFileName(request.fileName, request.conversion.to),
        width: Math.round(width),
        height: Math.round(height),
      },
    ],
  };
}
