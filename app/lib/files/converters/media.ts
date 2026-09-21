import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  ConversionCanceledError,
  FlacOutputFormat,
  Input,
  MkvOutputFormat,
  MovOutputFormat,
  Mp3OutputFormat,
  Mp4OutputFormat,
  OggOutputFormat,
  Output,
  OutputFormat,
  Quality,
  WavOutputFormat,
  WebMOutputFormat,
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  type AudioCodec,
  type ConversionAudioOptions,
  type ConversionVideoOptions,
  type DiscardedTrack,
  type InputAudioTrack,
  type InputTrack,
  type InputVideoTrack,
  type VideoCodec,
} from "mediabunny";
import { detectBrowserName } from "../../browser";
import { outputFileName } from "../formats";
import type {
  ConvertRequest,
  ConvertResult,
  FileFormat,
  MediaAudioCodecId,
  MediaContainerId,
} from "../types";

function createOutputFormat(container: MediaContainerId): OutputFormat {
  switch (container) {
    case "mp4":
      return new Mp4OutputFormat();
    case "mov":
      return new MovOutputFormat();
    case "mkv":
      return new MkvOutputFormat();
    case "webm":
      return new WebMOutputFormat();
    case "mp3":
      return new Mp3OutputFormat();
    case "wav":
      return new WavOutputFormat();
    case "ogg":
      return new OggOutputFormat();
    case "flac":
      return new FlacOutputFormat();
  }
}

const CODEC_LABELS: Record<string, string> = {
  avc: "H.264",
  hevc: "HEVC",
  vp8: "VP8",
  vp9: "VP9",
  av1: "AV1",
  prores: "ProRes",
  aac: "AAC",
  opus: "Opus",
  mp3: "MP3",
  vorbis: "Vorbis",
  flac: "FLAC",
};

function codecLabel(codec: string): string {
  return CODEC_LABELS[codec] ?? codec.toUpperCase();
}

/** Codecs whose output size is fixed by the sample format, so bitrate means nothing. */
function isLossless(codec: AudioCodec): boolean {
  return codec === "flac" || codec.startsWith("pcm-");
}

function abortError(): DOMException {
  return new DOMException("The conversion was cancelled.", "AbortError");
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw abortError();
}

let mp3EncoderReady: Promise<void> | null = null;

/**
 * No browser's WebCodecs `AudioEncoder` can encode MP3 — it is decode-only —
 * so MP3 output needs mediabunny's LAME extension (wasm, ~310 kB minified).
 * It is imported on demand so visitors converting images never download it.
 */
async function ensureMp3Encoder(): Promise<void> {
  mp3EncoderReady ??= import("@mediabunny/mp3-encoder").then(
    ({ registerMp3Encoder }) => {
      registerMp3Encoder();
    },
  );
  try {
    await mp3EncoderReady;
  } catch (error) {
    mp3EncoderReady = null;
    throw new Error("The MP3 encoder could not be loaded.", { cause: error });
  }
}

/**
 * Registers any extension encoders the target codecs need. Must run before
 * encoding *and* before probing, because probe results are cached forever.
 */
export async function prepareAudioEncoders(
  codecs: readonly MediaAudioCodecId[],
): Promise<void> {
  if (!codecs.includes("mp3")) return;
  await ensureMp3Encoder();
}

async function assertDecodable(
  track: InputTrack,
  kind: "audio" | "video",
): Promise<void> {
  if (await track.canDecode()) return;
  const codec = await track.getCodec();
  if (!codec) {
    throw new Error(`This file uses a ${kind} codec your browser does not recognise.`);
  }
  throw new Error(`${detectBrowserName()} cannot decode ${codecLabel(codec)} ${kind}.`);
}

async function readTracks(
  input: Input,
  from: FileFormat,
): Promise<{ video: InputVideoTrack | null; audio: InputAudioTrack | null }> {
  try {
    const [video, audio] = await Promise.all([
      input.getPrimaryVideoTrack(),
      input.getPrimaryAudioTrack(),
    ]);
    return { video, audio };
  } catch (error) {
    throw new Error(`This file could not be read as ${from.label}.`, {
      cause: error,
    });
  }
}

/**
 * Pick the first codec the browser can encode, out of the format's preference
 * list narrowed to what the chosen container can actually hold.
 */
async function pickAudioCodec(
  format: OutputFormat,
  preferred: AudioCodec[],
  track: InputAudioTrack,
): Promise<AudioCodec | null> {
  const supported = new Set<AudioCodec>(format.getSupportedAudioCodecs());
  const candidates = preferred.filter((codec) => supported.has(codec));
  if (candidates.length === 0) return null;

  const [numberOfChannels, sampleRate] = await Promise.all([
    track.getNumberOfChannels(),
    track.getSampleRate(),
  ]);
  return getFirstEncodableAudioCodec(candidates, {
    numberOfChannels,
    sampleRate,
  });
}

async function pickVideoCodec(
  format: OutputFormat,
  preferred: VideoCodec[],
  size: { width: number; height: number },
  bitrate: number,
): Promise<VideoCodec | null> {
  const supported = new Set<VideoCodec>(format.getSupportedVideoCodecs());
  const candidates = preferred.filter((codec) => supported.has(codec));
  if (candidates.length === 0) return null;

  return getFirstEncodableVideoCodec(candidates, {
    width: size.width,
    height: size.height,
    quality: new Quality({ bitrate }),
  });
}

function discardMessage(
  discarded: DiscardedTrack[],
  to: FileFormat,
): string | null {
  for (const { track, reason } of discarded) {
    const kind = track.isVideoTrack() ? "video" : "audio";
    if (reason === "no_encodable_target_codec") {
      return `${detectBrowserName()} cannot encode ${to.label} ${kind}.`;
    }
    if (reason === "undecodable_source_codec") {
      return `${detectBrowserName()} cannot decode the ${kind} in this file.`;
    }
    if (reason === "unknown_source_codec") {
      return `This file uses a ${kind} codec your browser does not recognise.`;
    }
    if (reason === "max_track_count_of_type_reached") {
      return `${to.label} files cannot hold this file's ${kind}.`;
    }
  }
  return null;
}

/**
 * Convert audio and video entirely in the browser.
 *
 * Tracks are copied across containers untouched whenever the source codec fits
 * the target container, so remuxes (MOV to MP4, extracting AAC from an MP4)
 * stay lossless and fast. Re-encoding only happens when the codec cannot travel
 * as-is or when the video has to be scaled down.
 */
export async function convertMedia(
  request: ConvertRequest,
): Promise<ConvertResult> {
  const { conversion, options, signal } = request;
  const { from, to } = conversion;

  if (signal?.aborted) throw abortError();

  const media = to.media;
  if (!media) {
    throw new Error(`${to.label} is not a media format.`);
  }

  const format = createOutputFormat(media.container);
  const input = new Input({
    source: new BlobSource(request.file),
    formats: ALL_FORMATS,
  });

  try {
    const tracks = await readTracks(input, from);
    throwIfAborted(signal);
    const wantsVideo = to.kind === "video";

    if (wantsVideo && !tracks.video) {
      throw new Error("This file does not contain a video track.");
    }
    if (!tracks.audio && (to.kind === "audio" || !tracks.video)) {
      throw new Error("This file does not contain an audio track.");
    }

    let audioOptions: ConversionAudioOptions | undefined;
    if (tracks.audio) {
      await prepareAudioEncoders(media.audioCodecs);
      throwIfAborted(signal);

      const sourceCodec = await tracks.audio.getCodec();
      // Gate on the codecs this format is declared to write, not on everything
      // the container could legally hold: MP4 accepts Vorbis and PCM, but an
      // .m4a is expected to contain AAC.
      const copyable =
        sourceCodec !== null &&
        (media.audioCodecs as string[]).includes(sourceCodec);

      if (copyable) {
        // Naming the source codec keeps the copy fast path (conversion.js:1279-1288
        // only transcodes when the requested codec differs) and pins the codec
        // should mediabunny decide it has to re-encode after all.
        audioOptions = { codec: sourceCodec };
      } else {
        await assertDecodable(tracks.audio, "audio");
        const codec = await pickAudioCodec(
          format,
          media.audioCodecs,
          tracks.audio,
        );
        if (!codec) {
          throw new Error(`${detectBrowserName()} cannot encode ${to.label} audio.`);
        }
        audioOptions = isLossless(codec)
          ? { codec }
          : { codec, quality: new Quality({ bitrate: options.audio.bitrate }) };
      }
    }

    throwIfAborted(signal);

    let videoOptions: ConversionVideoOptions | undefined;
    let size: { width: number; height: number } | undefined;

    if (!wantsVideo) {
      videoOptions = { discard: true };
    } else if (tracks.video) {
      const [sourceCodec, width, height] = await Promise.all([
        tracks.video.getCodec(),
        tracks.video.getDisplayWidth(),
        tracks.video.getDisplayHeight(),
      ]);

      const maxHeight = options.video.maxHeight;
      const scaledHeight =
        maxHeight && maxHeight > 0 && height > maxHeight ? maxHeight : null;
      size = scaledHeight
        ? {
            width: Math.max(1, Math.round((width * scaledHeight) / height)),
            height: scaledHeight,
          }
        : { width, height };

      // Same reasoning as audio: MP4 can legally hold VP9, but a .mp4 that only
      // plays in Chrome is not what anyone asked for.
      const containerSupports =
        sourceCodec !== null &&
        ((media.videoCodecs ?? []) as string[]).includes(sourceCodec);

      if (containerSupports && !scaledHeight) {
        videoOptions = { codec: sourceCodec as VideoCodec };
      } else {
        await assertDecodable(tracks.video, "video");
        // Scaling alone still allows keeping the original codec, which avoids a
        // needless generation loss, so it goes to the front of the preferences.
        const preferred =
          containerSupports && sourceCodec
            ? [sourceCodec, ...(media.videoCodecs ?? [])]
            : (media.videoCodecs ?? []);
        const codec = await pickVideoCodec(
          format,
          preferred,
          size,
          options.video.bitrate,
        );
        if (!codec) {
          throw new Error(`${detectBrowserName()} cannot encode ${to.label} video.`);
        }
        videoOptions = {
          codec,
          quality: new Quality({ bitrate: options.video.bitrate }),
          ...(scaledHeight ? { height: scaledHeight } : {}),
        };
      }
    }

    const output = new Output({ format, target: new BufferTarget() });
    throwIfAborted(signal);
    const mediaConversion = await Conversion.init({
      input,
      output,
      video: videoOptions,
      audio: audioOptions,
      showWarnings: false,
    });

    const utilized = (type: "audio" | "video") =>
      mediaConversion.utilizedTracks.some((track) => track.type === type);

    if (!mediaConversion.isValid || (to.kind === "audio" && !utilized("audio"))) {
      throw new Error(
        discardMessage(mediaConversion.discardedTracks, to) ??
          `This file cannot be converted to ${to.label}.`,
      );
    }
    if (wantsVideo && !utilized("video")) {
      throw new Error(
        discardMessage(mediaConversion.discardedTracks, to) ??
          `This file's video cannot be stored in ${to.label}.`,
      );
    }

    mediaConversion.onProgress = (progress) => {
      request.onProgress?.(Math.min(1, Math.max(0, progress)));
    };

    const cancel = () => {
      void mediaConversion.cancel();
    };
    // `addEventListener` never fires on an already-aborted signal, so a cancel
    // during the setup above would otherwise run the whole encode anyway.
    throwIfAborted(signal);
    signal?.addEventListener("abort", cancel, { once: true });

    try {
      await mediaConversion.execute();
    } catch (error) {
      if (signal?.aborted || error instanceof ConversionCanceledError) {
        throw abortError();
      }
      throw new Error(
        `This ${from.label} file could not be converted to ${to.label}.`,
        { cause: error },
      );
    } finally {
      signal?.removeEventListener("abort", cancel);
    }

    throwIfAborted(signal);

    const buffer = output.target.buffer;
    if (!buffer) {
      throw new Error("The conversion produced no data.");
    }

    request.onProgress?.(1);
    return {
      outputs: [
        {
          blob: new Blob([buffer], { type: to.mime }),
          name: outputFileName(request.fileName, to),
          width: size?.width,
          height: size?.height,
        },
      ],
    };
  } finally {
    input.dispose();
  }
}
