import type { PDFDocument as PDFDocumentType } from "@cantoo/pdf-lib";

/** Thrown when a PDF cannot be opened without a password the user would have to type. */
export class ProtectedPdfError extends Error {
  constructor() {
    super("This PDF is password-protected, so it cannot be merged.");
    this.name = "ProtectedPdfError";
  }
}

/**
 * Open a PDF for reading its pages. Files that are only locked against editing
 * (an owner password, with an empty open password) are decrypted with the
 * empty password — any PDF viewer opens those without asking. Files that
 * really need a password to open are reported as protected.
 */
async function loadPdf(source: Blob): Promise<PDFDocumentType> {
  const { PDFDocument, EncryptedPDFError } = await import("@cantoo/pdf-lib");
  const bytes = new Uint8Array(await source.arrayBuffer());
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    if (!(error instanceof EncryptedPDFError)) throw error;
  }
  try {
    const document = await PDFDocument.load(bytes, { password: "" });
    if (document.isEncrypted) throw new ProtectedPdfError();
    return document;
  } catch {
    throw new ProtectedPdfError();
  }
}

/** Number of pages in a PDF. Also validates that the file can be merged. */
export async function countPdfPages(source: Blob): Promise<number> {
  const document = await loadPdf(source);
  return document.getPageCount();
}

type PdfLib = typeof import("@cantoo/pdf-lib");
type PdfPage = import("@cantoo/pdf-lib").PDFPage;
type PdfArray = import("@cantoo/pdf-lib").PDFArray;

/**
 * How pages of different sizes are made to line up:
 * - `first`: every page takes the size of the very first page
 * - `a4` / `letter`: every page is fitted to that paper size
 * - `original`: pages keep their own sizes
 *
 * Portrait and landscape pages keep their orientation in every mode.
 */
export type MergePageSize = "first" | "a4" | "letter" | "original";

/** Paper sizes in PDF points (1/72 inch), short side first. */
const PAPER_SIZES: Record<"a4" | "letter", [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

/** Differences smaller than this (in points) are treated as the same size. */
const SIZE_TOLERANCE = 0.5;

function isQuarterTurn(page: PdfPage): boolean {
  const angle = ((page.getRotation().angle % 360) + 360) % 360;
  return angle === 90 || angle === 270;
}

/** The size a viewer shows: the crop box, turned by the page's rotation. */
function displaySize(page: PdfPage): { width: number; height: number } {
  const { width, height } = page.getCropBox();
  return isQuarterTurn(page)
    ? { width: height, height: width }
    : { width, height };
}

/** Short and long side of a page as displayed. */
function sides(page: PdfPage): [number, number] {
  const { width, height } = displaySize(page);
  return [Math.min(width, height), Math.max(width, height)];
}

/** Map every x,y pair in a PDF number array through `x·s + tx, y·s + ty`. */
function transformPoints(
  lib: PdfLib,
  list: PdfArray,
  s: number,
  tx: number,
  ty: number,
) {
  for (let i = 0; i < list.size(); i++) {
    const value = list.lookup(i);
    if (!(value instanceof lib.PDFNumber)) continue;
    const shift = i % 2 === 0 ? tx : ty;
    list.set(i, lib.PDFNumber.of(value.asNumber() * s + shift));
  }
}

/**
 * Resize a page to the given paper size (short side, long side), scaling its
 * content to fit and centring it. Nothing is rasterised: the existing content
 * stream is wrapped in a transform, so text stays selectable and vector art
 * stays sharp. Link and comment positions are moved with the content.
 */
function fitPage(lib: PdfLib, page: PdfPage, [short, long]: [number, number]) {
  const box = page.getCropBox();
  const quarter = isQuarterTurn(page);
  const shown = displaySize(page);
  const landscape = shown.width > shown.height;
  const shownWidth = landscape ? long : short;
  const shownHeight = landscape ? short : long;
  // Work in the page's own, unrotated coordinates; /Rotate is left as it is.
  const width = quarter ? shownHeight : shownWidth;
  const height = quarter ? shownWidth : shownHeight;

  const alreadyFits =
    Math.abs(box.width - width) < SIZE_TOLERANCE &&
    Math.abs(box.height - height) < SIZE_TOLERANCE;
  if (alreadyFits) return;

  const s = Math.min(width / box.width, height / box.height);
  const tx = (width - box.width * s) / 2 - box.x * s;
  const ty = (height - box.height * s) / 2 - box.y * s;

  const { context } = page.doc;
  page.node.normalize();
  const start = context.register(
    context.contentStream([
      lib.pushGraphicsState(),
      lib.concatTransformationMatrix(s, 0, 0, s, tx, ty),
      // Clip to the old visible area, so content the crop box used to hide
      // does not show up in the new margins.
      lib.rectangle(box.x, box.y, box.width, box.height),
      lib.clip(),
      lib.endPath(),
    ]),
  );
  const end = context.register(context.contentStream([lib.popGraphicsState()]));
  page.node.wrapContentStreams(start, end);

  page.setMediaBox(0, 0, width, height);
  page.setCropBox(0, 0, width, height);
  for (const name of ["BleedBox", "TrimBox", "ArtBox"]) {
    page.node.delete(lib.PDFName.of(name));
  }

  const annotations = page.node.Annots();
  if (!annotations) return;
  for (let i = 0; i < annotations.size(); i++) {
    const annotation = annotations.lookup(i);
    if (!(annotation instanceof lib.PDFDict)) continue;
    for (const key of ["Rect", "QuadPoints", "Vertices", "L", "CL"]) {
      const list = annotation.lookup(lib.PDFName.of(key));
      if (list instanceof lib.PDFArray) transformPoints(lib, list, s, tx, ty);
    }
    const inkLists = annotation.lookup(lib.PDFName.of("InkList"));
    if (inkLists instanceof lib.PDFArray) {
      for (let j = 0; j < inkLists.size(); j++) {
        const stroke = inkLists.lookup(j);
        if (stroke instanceof lib.PDFArray) {
          transformPoints(lib, stroke, s, tx, ty);
        }
      }
    }
    // RD holds margins, not coordinates, so it is only scaled.
    const margins = annotation.lookup(lib.PDFName.of("RD"));
    if (margins instanceof lib.PDFArray) transformPoints(lib, margins, s, 0, 0);
  }
}

/**
 * Join PDFs into one document, keeping their order. Pages are copied, not
 * rasterised, so text stays selectable. With a page size other than
 * `original`, every page is scaled to the same paper size.
 */
export async function mergePdfs(
  sources: Blob[],
  {
    pageSize = "original",
    onProgress,
  }: {
    pageSize?: MergePageSize;
    onProgress?: (fraction: number) => void;
  } = {},
): Promise<Blob> {
  const lib = await import("@cantoo/pdf-lib");
  const merged = await lib.PDFDocument.create();
  let target: [number, number] | null =
    pageSize === "a4" || pageSize === "letter" ? PAPER_SIZES[pageSize] : null;

  for (const [index, source] of sources.entries()) {
    const document = await loadPdf(source);
    const pages = await merged.copyPages(document, document.getPageIndices());
    for (const page of pages) {
      if (pageSize === "first") target ??= sides(page);
      if (target) fitPage(lib, page, target);
      merged.addPage(page);
    }
    onProgress?.((index + 1) / sources.length);
  }
  const bytes = await merged.save();
  return new Blob([bytes], { type: "application/pdf" });
}
