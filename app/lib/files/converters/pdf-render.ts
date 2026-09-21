import { detectBrowserName } from "../../browser";
import { encodeDrawable } from "./canvas-image";
import { numberedFileName } from "../formats";
import type { ConvertRequest, ConvertResult, ConvertOutput, Drawable } from "../types";

/**
 * Served as a plain static file from public/ (see scripts/copy_pdf_worker.sh).
 * A bundler-relative `new URL("...", import.meta.url)` reference does not
 * survive `output: "export"`, so the worker is referenced absolutely instead.
 */
const WORKER_SRC = "/pdf.worker.min.mjs";

/** PDF user space is 1/72 inch per unit, so this turns a DPI into a scale. */
const POINTS_PER_INCH = 72;

/** Browsers refuse canvases larger than this, and get slow well before it. */
const MAX_CANVAS_SIDE = 16_384;
const MAX_CANVAS_PIXELS = 268_000_000;

/** Beyond this a browser tab runs out of memory long before the job finishes. */
const MAX_PAGES = 500;

let workerConfigured = false;

async function configureWorker(): Promise<void> {
  if (workerConfigured) return;
  const { GlobalWorkerOptions } = await import("pdfjs-dist");
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = WORKER_SRC;
  }
  workerConfigured = true;
}

function abortError(): Error {
  return new DOMException("The conversion was cancelled.", "AbortError");
}

/**
 * Shrink the requested scale until the page fits inside canvas limits.
 * Returns the scale actually usable, which may be the requested one.
 */
function fittedScale(width: number, height: number, scale: number): number {
  if (width <= 0 || height <= 0) {
    throw new Error("This PDF has a page with no usable size.");
  }
  const limit = Math.min(
    MAX_CANVAS_SIDE / width,
    MAX_CANVAS_SIDE / height,
    Math.sqrt(MAX_CANVAS_PIXELS / (width * height)),
  );
  const fitted = Math.min(scale, limit);
  if (fitted * Math.max(width, height) < 1) {
    throw new Error("This PDF page is too large to render in a browser.");
  }
  return fitted;
}

function drawableFromCanvas(canvas: HTMLCanvasElement): Drawable {
  return {
    width: canvas.width,
    height: canvas.height,
    source: canvas,
    close: () => {
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

/** Rasterise every page of a PDF into one image file per page. */
export async function renderPdfToImages(
  request: ConvertRequest,
): Promise<ConvertResult> {
  await configureWorker();
  const { getDocument, PasswordException } = await import("pdfjs-dist");

  const imageOptions = request.options.image;
  const dpi = request.options.document.dpi > 0 ? request.options.document.dpi : 150;
  const requestedScale = dpi / POINTS_PER_INCH;

  const data = new Uint8Array(await request.file.arrayBuffer());
  const loadingTask = getDocument({ data });

  let pdfDocument;
  try {
    pdfDocument = await loadingTask.promise;
  } catch (error) {
    await loadingTask.destroy().catch(() => undefined);
    if (error instanceof PasswordException) {
      throw new Error("This PDF is password protected.");
    }
    throw new Error("This file could not be read as a PDF.");
  }

  try {
    const pageCount = pdfDocument.numPages;
    if (pageCount < 1) throw new Error("This PDF has no pages.");
    if (pageCount > MAX_PAGES) {
      throw new Error(
        `This PDF has ${pageCount} pages, which is more than the ${MAX_PAGES} this converter can handle in one go.`,
      );
    }

    const outputs: ConvertOutput[] = [];

    for (let i = 0; i < pageCount; i += 1) {
      if (request.signal?.aborted) throw abortError();

      const page = await pdfDocument.getPage(i + 1);
      try {
        const unscaled = page.getViewport({ scale: 1 });
        const scale = fittedScale(unscaled.width, unscaled.height, requestedScale);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error(`${detectBrowserName()} blocked canvas rendering.`);

        // PDF pages have no alpha — paint the paper colour first so that even
        // PNG output looks like the printed page rather than a transparent one.
        ctx.fillStyle = imageOptions.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvas,
          viewport,
          background: imageOptions.background,
        });
        await renderTask.promise;

        const drawable = drawableFromCanvas(canvas);
        try {
          const encoded = await encodeDrawable(
            drawable,
            request.conversion.to.mime,
            imageOptions,
          );
          outputs.push({
            blob: encoded.blob,
            name: numberedFileName(
              request.fileName,
              request.conversion.to,
              i,
              pageCount,
              "page",
            ),
            width: encoded.width,
            height: encoded.height,
          });
        } finally {
          drawable.close();
        }
      } finally {
        page.cleanup();
      }

      request.onProgress?.((i + 1) / pageCount);
    }

    return { outputs };
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }
}
