import { FILE_FORMATS, FORMAT_KIND_ORDER, getFormat } from "./formats";
import type {
  EngineId,
  FileConversion,
  FileFormat,
  FormatKind,
} from "./types";

/**
 * A rule says "every format in `from` can be converted to every format in
 * `to`, using `engine`". The registry is the union of these rules, so adding a
 * format is a data-only change: pages, search, browse cards and the sitemap all
 * follow automatically.
 */
type ConversionRule = {
  from: string[];
  to: string[];
  /** Fixed engine, or a picker when the source format decides (SVG, HEIC). */
  engine: EngineId | ((from: FileFormat) => EngineId);
};

/**
 * Images the browser can read. PNG/JPEG/WEBP/GIF/BMP/AVIF/ICO decode natively,
 * SVG is rasterised, HEIC goes through a lazily loaded decoder.
 */
const IMAGE_SOURCES = [
  "heic",
  "png",
  "jpg",
  "webp",
  "avif",
  "svg",
  "gif",
  "bmp",
  "ico",
];

/**
 * Images a browser canvas can write. There is deliberately no AVIF or HEIC
 * here — no browser ships an encoder for them.
 */
const IMAGE_TARGETS = ["jpg", "png", "webp"];

const AUDIO_FORMATS = ["mp3", "wav", "m4a", "ogg", "opus", "flac"];
const VIDEO_FORMATS = ["mp4", "webm", "mov", "mkv"];

function imageEngine(from: FileFormat): EngineId {
  if (from.id === "svg") return "svg";
  if (from.id === "heic") return "heic";
  return "canvas";
}

const RULES: ConversionRule[] = [
  { from: IMAGE_SOURCES, to: IMAGE_TARGETS, engine: imageEngine },
  { from: AUDIO_FORMATS, to: AUDIO_FORMATS, engine: "media" },
  { from: VIDEO_FORMATS, to: VIDEO_FORMATS, engine: "media" },
  { from: VIDEO_FORMATS, to: AUDIO_FORMATS, engine: "media" },
  { from: ["pdf"], to: ["jpg", "png"], engine: "pdf-render" },
  { from: ["jpg", "png", "webp", "heic"], to: ["pdf"], engine: "pdf-build" },
];

export function fileSlugFor(from: FileFormat, to: FileFormat): string {
  return `${from.id}-to-${to.id}`;
}

function buildConversions(): FileConversion[] {
  const seen = new Set<string>();
  const conversions: FileConversion[] = [];

  for (const rule of RULES) {
    for (const fromId of rule.from) {
      const from = getFormat(fromId);
      if (!from) continue;
      for (const toId of rule.to) {
        const to = getFormat(toId);
        if (!to || to.id === from.id) continue;

        const slug = fileSlugFor(from, to);
        if (seen.has(slug)) continue;
        seen.add(slug);

        conversions.push({
          from,
          to,
          engine:
            typeof rule.engine === "function" ? rule.engine(from) : rule.engine,
        });
      }
    }
  }

  return conversions;
}

const CONVERSIONS: FileConversion[] = buildConversions();

const CONVERSION_BY_SLUG = new Map(
  CONVERSIONS.map((c) => [fileSlugFor(c.from, c.to), c]),
);

function uniqueFormats(ids: Iterable<string>): FileFormat[] {
  const seen = new Set<string>();
  const formats: FileFormat[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const format = getFormat(id);
    if (format) formats.push(format);
  }
  return formats;
}

/** Every format that can be used as an input, in registry order. */
export const SOURCE_FORMATS: FileFormat[] = uniqueFormats(
  CONVERSIONS.map((c) => c.from.id),
);

/** Every format that can be produced, in registry order. */
export const TARGET_FORMATS: FileFormat[] = uniqueFormats(
  CONVERSIONS.map((c) => c.to.id),
);

export function canDecode(format: FileFormat): boolean {
  return SOURCE_FORMATS.some((f) => f.id === format.id);
}

export function canEncode(format: FileFormat): boolean {
  return TARGET_FORMATS.some((f) => f.id === format.id);
}

/** Every supported file conversion, in registry order. */
export function getFileConversions(): FileConversion[] {
  return CONVERSIONS;
}

/** Conversions that start from a given format. */
export function getConversionsFrom(format: FileFormat): FileConversion[] {
  return CONVERSIONS.filter((c) => c.from.id === format.id);
}

/** Target formats reachable from a given source format. */
export function getTargetsFor(format: FileFormat): FileFormat[] {
  return getConversionsFrom(format).map((c) => c.to);
}

/**
 * Parse a `<from>-to-<to>` slug. Aliases resolve to their canonical format, so
 * "jpeg-to-png" and "jpg-to-png" both return the same conversion.
 */
export function parseFileSlug(slug: string): FileConversion | null {
  const parts = slug.toLowerCase().split("-to-");
  if (parts.length !== 2) return null;
  const from = getFormat(parts[0]);
  const to = getFormat(parts[1]);
  if (!from || !to || from.id === to.id) return null;
  return CONVERSION_BY_SLUG.get(fileSlugFor(from, to)) ?? null;
}

export function getFileConversion(
  fromKey: string,
  toKey: string,
): FileConversion | null {
  return parseFileSlug(`${fromKey}-to-${toKey}`);
}

/**
 * The kind a conversion belongs to for grouping purposes. Cross-kind
 * conversions are filed under their input, which is how people look for them
 * ("MP4 to MP3" is a video job, "JPG to PDF" an image one).
 */
export function conversionKind(conversion: FileConversion): FormatKind {
  return conversion.from.kind;
}

/** All conversions grouped by kind, in display order. */
export function getFileConversionsByKind(): {
  kind: FormatKind;
  conversions: FileConversion[];
}[] {
  return FORMAT_KIND_ORDER.map((kind) => ({
    kind,
    conversions: CONVERSIONS.filter((c) => conversionKind(c) === kind),
  })).filter((group) => group.conversions.length > 0);
}

/** Curated list of the most searched file conversions, in display order. */
export const POPULAR_FILE_SLUGS = [
  "heic-to-jpg",
  "png-to-jpg",
  "mp4-to-mp3",
  "jpg-to-png",
  "pdf-to-jpg",
  "mov-to-mp4",
  "webp-to-png",
  "jpg-to-pdf",
  "m4a-to-mp3",
  "webp-to-jpg",
  "mkv-to-mp4",
  "wav-to-mp3",
  "png-to-webp",
  "flac-to-mp3",
  "svg-to-png",
  "mp4-to-webm",
] as const;

export function getPopularFileConversions(): FileConversion[] {
  return POPULAR_FILE_SLUGS.map(parseFileSlug).filter(
    (c): c is FileConversion => c !== null,
  );
}

/** Short "PNG → JPG" style label used on cards. */
export function conversionTitle({ from, to }: FileConversion): string {
  return `${from.label} → ${to.label}`;
}

/** One-line description of what a conversion does, for cards and meta tags. */
export function describeFileConversion({ from, to }: FileConversion): string {
  if (from.kind === "document") {
    return `Turn every page of a ${from.label} into a separate ${to.label} image.`;
  }
  if (to.kind === "document") {
    return `Combine ${from.label} images into a single ${to.label} document.`;
  }
  if (from.kind === "video" && to.kind === "audio") {
    return `Extract the soundtrack from ${from.label} video as ${to.label} audio.`;
  }
  if (from.kind === "video") {
    return `Re-encode ${from.label} video to ${to.label} in your browser.`;
  }
  if (from.kind === "audio") {
    if (!from.lossy && to.lossy) {
      return `Compress ${from.label} audio into smaller ${to.label} files.`;
    }
    if (from.lossy && !to.lossy) {
      return `Convert ${from.label} audio to lossless ${to.label}.`;
    }
    return `Convert ${from.label} audio to ${to.label} in your browser.`;
  }
  if (from.id === "svg") {
    return `Rasterise ${from.label} vectors to ${to.label} at any size.`;
  }
  if (from.id === "heic") {
    return `Turn iPhone ${from.label} photos into universally supported ${to.label}.`;
  }
  if (!from.lossy && to.lossy) {
    return `Shrink ${from.label} images into smaller ${to.label} files.`;
  }
  if (from.lossy && !to.lossy) {
    return `Convert ${from.label} images to lossless ${to.label}.`;
  }
  return `Convert ${from.label} images to ${to.label} in your browser.`;
}

/** Caveats worth telling the user about on the conversion page. */
export function conversionNotes(conversion: FileConversion): string[] {
  const { from, to } = conversion;
  const notes: string[] = [];

  if (from.kind === "document") {
    notes.push(
      "Each page becomes its own image, so a ten-page PDF produces ten files. Use “Download all” to get them as a ZIP.",
    );
    notes.push(
      "Raise the resolution for sharper text, but expect larger files and a slower conversion.",
    );
  }

  if (to.kind === "document") {
    notes.push(
      "Every image you add becomes one page, in the order the files are listed.",
    );
  }

  if (from.kind === "video" && to.kind === "audio") {
    notes.push(
      "Only the soundtrack is kept — the video track is discarded, which makes this much faster than a full conversion.",
    );
  }

  if (from.kind === "video" && to.kind === "video") {
    notes.push(
      "When the source already uses a codec the target container supports, the file is repackaged rather than re-encoded — that is near-instant and completely lossless.",
    );
    notes.push(
      "Otherwise the video is re-encoded using your device's hardware encoder. Large files can take several minutes, so keep this tab open.",
    );
  }

  if (from.kind === "audio" || to.kind === "audio") {
    if (!from.lossy && to.lossy) {
      notes.push(
        `${to.label} is a lossy format, so some audio detail is discarded. Raise the bitrate to keep more of it.`,
      );
    }
    if (from.lossy && !to.lossy) {
      notes.push(
        `Converting to ${to.label} cannot restore detail that ${from.label} already discarded — it only stops further loss.`,
      );
    }
  }

  if (from.alpha && !to.alpha && from.kind === "image" && to.kind === "image") {
    notes.push(
      `${to.label} has no transparency, so transparent areas are filled with the background colour you choose.`,
    );
  }
  if (from.id === "gif") {
    notes.push(
      "Animated GIFs are not animated in the target format — only the first frame is converted.",
    );
  }
  if (from.id === "svg") {
    notes.push(
      "Vectors become pixels: pick an output size before converting. Images and fonts loaded from other domains inside the SVG cannot be rendered.",
    );
  }
  if (from.id === "ico") {
    notes.push("Multi-size icon files are converted using their largest frame.");
  }
  if (to.lossy && to.kind === "image") {
    notes.push(
      `${to.label} is a lossy format — lower the quality for smaller files, raise it to keep detail.`,
    );
  }
  if (from.id === "heic") {
    notes.push(
      "HEIC decoding runs in your browser the first time you convert, so the first file may take a few seconds.",
    );
  }

  if (from.kind === "audio" || from.kind === "video") {
    notes.push(
      "Conversion uses the audio and video codecs built into your browser, so results depend on your device. Unsupported targets are greyed out.",
    );
  }

  return notes;
}

/** Formats that appear as a search/browse facet. */
export function getFileFormats(): FileFormat[] {
  return FILE_FORMATS;
}
