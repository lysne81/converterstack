import { decodeImage, encodeDrawable } from "./converters/canvas-image";
import { outputFileName } from "./formats";
import type {
  ConvertRequest,
  ConvertResult,
  Drawable,
  ImageOptions,
} from "./types";

/** Decode whatever the image engines can read into a drawable bitmap. */
async function decodeForImageEngine(
  request: ConvertRequest,
  imageOptions: ImageOptions,
): Promise<{ drawable: Drawable; preScaled: boolean }> {
  const { engine } = request.conversion;

  if (engine === "svg") {
    const { decodeSvg } = await import("./converters/svg-raster");
    // Vectors are rasterised straight to the requested size, so the canvas
    // never has to scale pixels afterwards.
    const drawable = await decodeSvg(request.file, imageOptions.maxSize);
    return { drawable, preScaled: true };
  }

  if (engine === "heic") {
    const { decodeHeic } = await import("./converters/heic");
    return { drawable: await decodeHeic(request.file), preScaled: false };
  }

  return { drawable: await decodeImage(request.file), preScaled: false };
}

async function convertImage(request: ConvertRequest): Promise<ConvertResult> {
  const imageOptions = request.options.image;
  const { drawable, preScaled } = await decodeForImageEngine(
    request,
    imageOptions,
  );

  try {
    const encoded = await encodeDrawable(
      drawable,
      request.conversion.to.mime,
      preScaled ? { ...imageOptions, maxSize: undefined } : imageOptions,
    );
    request.onProgress?.(1);
    return {
      outputs: [
        {
          blob: encoded.blob,
          name: outputFileName(request.fileName, request.conversion.to),
          width: encoded.width,
          height: encoded.height,
        },
      ],
    };
  } finally {
    drawable.close();
  }
}

/**
 * Run a single file through the engine its conversion declares.
 *
 * Everything happens in the browser and every engine beyond the built-in canvas
 * path is imported lazily, so a visitor converting PNG to JPG never downloads
 * the media or PDF code. Nothing is uploaded.
 */
export async function convertFile(
  request: ConvertRequest,
): Promise<ConvertResult> {
  switch (request.conversion.engine) {
    case "media": {
      const { convertMedia } = await import("./converters/media");
      return convertMedia(request);
    }
    case "pdf-render": {
      const { renderPdfToImages } = await import("./converters/pdf-render");
      return renderPdfToImages(request);
    }
    case "pdf-build": {
      const { buildPdfFromImage } = await import("./converters/pdf-build");
      return buildPdfFromImage(request);
    }
    default:
      return convertImage(request);
  }
}
