import type { FileFormat, FormatKind } from "./types";

/**
 * Every file format the site knows about.
 *
 * Adding a format here (plus, if needed, an engine in ./converters) is all it
 * takes to get pages, search, browse tabs and sitemap entries — the rest of the
 * app derives everything from this registry.
 */
export const FILE_FORMATS: FileFormat[] = [
  {
    id: "png",
    label: "PNG",
    name: "Portable Network Graphics",
    extensions: ["png"],
    mime: "image/png",
    kind: "image",
    alpha: true,
    summary:
      "Lossless raster format with transparency — best for logos and screenshots.",
  },
  {
    id: "jpg",
    label: "JPG",
    name: "JPEG image",
    extensions: ["jpg", "jpeg"],
    mime: "image/jpeg",
    kind: "image",
    aliases: ["jpeg"],
    lossy: true,
    summary: "The universal photo format — small files, no transparency.",
  },
  {
    id: "webp",
    label: "WEBP",
    name: "WebP image",
    extensions: ["webp"],
    mime: "image/webp",
    kind: "image",
    lossy: true,
    alpha: true,
    summary: "Modern web format that beats both PNG and JPG on file size.",
  },
  {
    id: "heic",
    label: "HEIC",
    name: "High Efficiency Image Container",
    extensions: ["heic", "heif"],
    mime: "image/heic",
    kind: "image",
    aliases: ["heif", "iphone"],
    lossy: true,
    summary:
      "The format the iPhone camera uses — compact, but poorly supported elsewhere.",
  },
  {
    id: "avif",
    label: "AVIF",
    name: "AV1 Image File Format",
    extensions: ["avif"],
    mime: "image/avif",
    kind: "image",
    lossy: true,
    alpha: true,
    summary:
      "Very efficient next-generation format based on the AV1 video codec.",
  },
  {
    id: "gif",
    label: "GIF",
    name: "Graphics Interchange Format",
    extensions: ["gif"],
    mime: "image/gif",
    kind: "image",
    alpha: true,
    summary:
      "256-colour format best known for animation; conversions keep the first frame.",
  },
  {
    id: "bmp",
    label: "BMP",
    name: "Windows Bitmap",
    extensions: ["bmp"],
    mime: "image/bmp",
    kind: "image",
    summary: "Uncompressed Windows bitmap — large files, universally readable.",
  },
  {
    id: "ico",
    label: "ICO",
    name: "Windows Icon",
    extensions: ["ico"],
    mime: "image/x-icon",
    kind: "image",
    alpha: true,
    summary:
      "Icon container used for favicons and Windows application icons.",
  },
  {
    id: "svg",
    label: "SVG",
    name: "Scalable Vector Graphics",
    extensions: ["svg"],
    mime: "image/svg+xml",
    kind: "image",
    alpha: true,
    summary:
      "Vector graphics that stay sharp at any size — rasterised on conversion.",
  },

  // Audio
  {
    id: "mp3",
    label: "MP3",
    name: "MPEG Audio Layer III",
    extensions: ["mp3"],
    mime: "audio/mpeg",
    kind: "audio",
    lossy: true,
    media: { container: "mp3", audioCodecs: ["mp3"] },
    summary: "The universal audio format — plays on essentially every device.",
  },
  {
    id: "wav",
    label: "WAV",
    name: "Waveform Audio",
    extensions: ["wav", "wave"],
    mime: "audio/wav",
    kind: "audio",
    aliases: ["wave"],
    media: { container: "wav", audioCodecs: ["pcm-s16"] },
    summary:
      "Uncompressed studio audio — perfect quality, large files, always supported.",
  },
  {
    id: "m4a",
    label: "M4A",
    name: "MPEG-4 Audio (AAC)",
    extensions: ["m4a"],
    mime: "audio/mp4",
    kind: "audio",
    aliases: ["aac", "mp4a"],
    lossy: true,
    media: { container: "mp4", audioCodecs: ["aac"] },
    summary: "Apple's AAC audio — better quality than MP3 at the same size.",
  },
  {
    id: "ogg",
    label: "OGG",
    name: "Ogg audio",
    extensions: ["ogg", "oga"],
    mime: "audio/ogg",
    kind: "audio",
    aliases: ["vorbis", "oga"],
    lossy: true,
    media: { container: "ogg", audioCodecs: ["vorbis", "opus"] },
    summary: "Open, royalty-free audio container used by games and Wikipedia.",
  },
  {
    id: "opus",
    label: "OPUS",
    name: "Opus audio",
    extensions: ["opus"],
    mime: "audio/opus",
    kind: "audio",
    lossy: true,
    media: { container: "ogg", audioCodecs: ["opus"] },
    summary:
      "The most efficient modern codec — excellent quality at low bitrates.",
  },
  {
    id: "flac",
    label: "FLAC",
    name: "Free Lossless Audio Codec",
    extensions: ["flac"],
    mime: "audio/flac",
    kind: "audio",
    media: { container: "flac", audioCodecs: ["flac"] },
    summary:
      "Lossless compression — identical to the original at about half the size.",
  },

  // Video
  {
    id: "mp4",
    label: "MP4",
    name: "MPEG-4 video",
    extensions: ["mp4", "m4v"],
    mime: "video/mp4",
    kind: "video",
    aliases: ["m4v", "h264"],
    lossy: true,
    media: {
      container: "mp4",
      audioCodecs: ["aac", "opus"],
      videoCodecs: ["avc", "hevc", "av1"],
    },
    summary: "The default video format — plays everywhere, from phones to TVs.",
  },
  {
    id: "webm",
    label: "WEBM",
    name: "WebM video",
    extensions: ["webm"],
    mime: "video/webm",
    kind: "video",
    aliases: ["vp9"],
    lossy: true,
    media: {
      container: "webm",
      audioCodecs: ["opus", "vorbis"],
      videoCodecs: ["vp9", "vp8", "av1"],
    },
    summary: "Open, royalty-free web video — smaller files than MP4.",
  },
  {
    id: "mov",
    label: "MOV",
    name: "QuickTime movie",
    extensions: ["mov", "qt"],
    mime: "video/quicktime",
    kind: "video",
    aliases: ["quicktime"],
    lossy: true,
    media: {
      container: "mov",
      audioCodecs: ["aac"],
      videoCodecs: ["avc", "hevc"],
    },
    summary:
      "Apple's video container, produced by iPhone and Mac screen recordings.",
  },
  {
    id: "mkv",
    label: "MKV",
    name: "Matroska video",
    extensions: ["mkv"],
    mime: "video/x-matroska",
    kind: "video",
    aliases: ["matroska"],
    lossy: true,
    media: {
      container: "mkv",
      audioCodecs: ["opus", "aac", "vorbis"],
      videoCodecs: ["avc", "vp9", "av1", "vp8"],
    },
    summary:
      "Flexible container favoured by archives — holds almost any codec.",
  },

  // Document
  {
    id: "pdf",
    label: "PDF",
    name: "Portable Document Format",
    extensions: ["pdf"],
    mime: "application/pdf",
    kind: "document",
    aliases: ["document", "acrobat"],
    summary: "Fixed-layout documents that look identical everywhere.",
  },
];

export const FORMAT_KIND_LABELS: Record<FormatKind, string> = {
  image: "Image",
  audio: "Audio",
  video: "Video",
  document: "Document",
};

/** Plural heading used for the grouped sections of the /files hub. */
export const FORMAT_KIND_HEADINGS: Record<FormatKind, string> = {
  image: "Image converters",
  audio: "Audio converters",
  video: "Video converters",
  document: "Document converters",
};

/** Display order for kind-grouped listings. */
export const FORMAT_KIND_ORDER: FormatKind[] = [
  "image",
  "audio",
  "video",
  "document",
];

/** All strings that should resolve to this format (id, aliases, extensions). */
export function formatKeys(format: FileFormat): string[] {
  return [format.id, ...(format.aliases ?? []), ...format.extensions].map((k) =>
    k.toLowerCase(),
  );
}

const FORMAT_BY_KEY = new Map<string, FileFormat>();
for (const format of FILE_FORMATS) {
  for (const key of formatKeys(format)) {
    if (!FORMAT_BY_KEY.has(key)) FORMAT_BY_KEY.set(key, format);
  }
}

/** Resolve an id, alias or extension (with or without a leading dot) to a format. */
export function getFormat(key: string): FileFormat | undefined {
  return FORMAT_BY_KEY.get(key.trim().toLowerCase().replace(/^\./, ""));
}

/** Resolve a filename to the format implied by its extension. */
export function formatForFileName(name: string): FileFormat | undefined {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return undefined;
  return getFormat(name.slice(dot + 1));
}

/** The `accept` attribute value for a file input restricted to `format`. */
export function acceptFor(format: FileFormat): string {
  return [...format.extensions.map((e) => `.${e}`), format.mime].join(",");
}

/** Replace a file's extension with the target format's canonical one. */
export function outputFileName(name: string, to: FileFormat): string {
  const base = baseFileName(name);
  return `${base}.${to.extensions[0]}`;
}

/** A file name without its extension, never empty. */
export function baseFileName(name: string): string {
  return name.replace(/\.[^./\\]+$/, "") || "converted";
}

/**
 * Output name for one of several files produced from a single input, e.g.
 * `report-page-03.jpg`. Numbers are zero-padded so they sort correctly.
 */
export function numberedFileName(
  name: string,
  to: FileFormat,
  index: number,
  total: number,
  part = "page",
): string {
  const base = baseFileName(name);
  if (total <= 1) return `${base}.${to.extensions[0]}`;
  const width = String(total).length;
  const number = String(index + 1).padStart(width, "0");
  return `${base}-${part}-${number}.${to.extensions[0]}`;
}
