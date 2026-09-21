/** Shared types for the file-conversion registry and engines. */

/** Top-level family a format belongs to. */
export type FormatKind = "image" | "audio" | "video" | "document";

/** Which engine knows how to run a given conversion. */
export type EngineId =
  | "canvas"
  | "svg"
  | "heic"
  | "media"
  | "pdf-render"
  | "pdf-build";

/**
 * Container written by the media engine. These mirror mediabunny's output
 * format classes, but are kept as plain strings so the registry stays a
 * data-only module that never pulls the library into the shared bundle.
 */
export type MediaContainerId =
  | "mp4"
  | "mov"
  | "mkv"
  | "webm"
  | "mp3"
  | "wav"
  | "ogg"
  | "flac";

export type MediaAudioCodecId =
  | "aac"
  | "opus"
  | "mp3"
  | "vorbis"
  | "flac"
  | "pcm-s16";

export type MediaVideoCodecId = "avc" | "hevc" | "vp9" | "vp8" | "av1";

/**
 * How a media format is written.
 *
 * Codecs are listed in preference order: the engine picks the first one this
 * browser can actually encode, which is why `.ogg` can fall back from Vorbis to
 * Opus instead of failing outright.
 */
export type MediaConfig = {
  container: MediaContainerId;
  audioCodecs: MediaAudioCodecId[];
  videoCodecs?: MediaVideoCodecId[];
};

export type FileFormat = {
  /** Slug-safe identifier used in URLs, e.g. "png". */
  id: string;
  /** Short display name, e.g. "PNG". */
  label: string;
  /** Full name, e.g. "Portable Network Graphics". */
  name: string;
  /** Lower-case file extensions, without the dot. First one is canonical. */
  extensions: string[];
  mime: string;
  kind: FormatKind;
  /** Extra search terms and slug aliases, e.g. "jpeg" for jpg. */
  aliases?: string[];
  /** True when the format throws away detail to save space. */
  lossy?: boolean;
  /** True when the format can store transparency. */
  alpha?: boolean;
  /** Audio/video only: how the media engine reads and writes this format. */
  media?: MediaConfig;
  /** One-line explanation shown on cards and converter pages. */
  summary: string;
};

export type FileConversion = {
  from: FileFormat;
  to: FileFormat;
  engine: EngineId;
};

/** Options for raster image output. */
export type ImageOptions = {
  /** 0–1, used by lossy targets (JPEG, WEBP). */
  quality: number;
  /** Optional downscale: the longest edge is capped to this many pixels. */
  maxSize?: number;
  /** Matte colour painted behind transparent pixels for opaque targets. */
  background: string;
};

/** Options for audio output. */
export type AudioOptions = {
  /** Target bitrate in bits per second. Ignored by lossless targets. */
  bitrate: number;
};

/** Options for video output. */
export type VideoOptions = {
  /** Target video bitrate in bits per second. */
  bitrate: number;
  /** Optional downscale: output height is capped to this many pixels. */
  maxHeight?: number;
};

export type PageSizeId = "fit" | "a4" | "letter";

/** Options for PDF input and output. */
export type DocumentOptions = {
  /** Resolution used when rasterising PDF pages to images. */
  dpi: number;
  /** Page geometry used when building a PDF from images. */
  pageSize: PageSizeId;
};

/**
 * The full option set. The UI only shows the group that matches the
 * conversion's kinds, but the whole object is always passed to engines so that
 * mixed conversions (video → audio, PDF → image) can read more than one group.
 */
export type ConvertOptions = {
  image: ImageOptions;
  audio: AudioOptions;
  video: VideoOptions;
  document: DocumentOptions;
};

export const DEFAULT_CONVERT_OPTIONS: ConvertOptions = {
  image: { quality: 0.9, background: "#ffffff" },
  audio: { bitrate: 192_000 },
  video: { bitrate: 4_000_000 },
  document: { dpi: 150, pageSize: "fit" },
};

/** One produced file. A single input can yield many (one per PDF page). */
export type ConvertOutput = {
  blob: Blob;
  /** Complete file name including the extension. */
  name: string;
  width?: number;
  height?: number;
};

export type ConvertResult = {
  outputs: ConvertOutput[];
};

/** Everything an engine needs to convert one file. */
export type ConvertRequest = {
  file: Blob;
  /** Original file name, used to derive output names. */
  fileName: string;
  conversion: FileConversion;
  options: ConvertOptions;
  /** Aborts long-running work (video encoding, multi-page PDFs). */
  signal?: AbortSignal;
  /** Reports 0–1 completion. Engines that cannot measure progress omit it. */
  onProgress?: (fraction: number) => void;
};

/**
 * A decoded image ready to be drawn onto a canvas. `close()` releases the
 * underlying bitmap or object URL — always call it when done.
 */
export type Drawable = {
  width: number;
  height: number;
  source: CanvasImageSource;
  close: () => void;
};

/** Result of asking whether the current browser can run a conversion. */
export type SupportState =
  | { state: "checking" }
  | { state: "ok" }
  | { state: "unsupported"; reason: string };
