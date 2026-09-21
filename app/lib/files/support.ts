"use client";

import { useEffect, useMemo, useState } from "react";
import { detectBrowserName } from "../browser";
import { canEncodeMime } from "./converters/canvas-image";
import { fileSlugFor, getConversionsFrom } from "./registry";
import type {
  FileConversion,
  FileFormat,
  MediaContainerId,
  SupportState,
} from "./types";

/**
 * Browser capability probing.
 *
 * Encode support genuinely varies: Firefox Android ships no WebCodecs encoders
 * at all, Safari only gained `AudioEncoder` in 26, and Linux Chromium builds
 * often lack AAC and H.264. Rather than hide those conversions, the UI asks
 * this module and disables them with an explanation.
 */

const CHECKING: SupportState = { state: "checking" };
const OK: SupportState = { state: "ok" };

function unsupported(reason: string): SupportState {
  return { state: "unsupported", reason };
}

const resolved = new Map<string, SupportState>();
const inFlight = new Map<string, Promise<SupportState>>();

/** Synchronous read of an already-resolved probe, or undefined if not resolved yet. */
export function getCachedSupport(
  conversion: FileConversion,
): SupportState | undefined {
  return resolved.get(fileSlugFor(conversion.from, conversion.to));
}

/** Probe once and cache. Safe to call repeatedly. */
export function probeConversion(
  conversion: FileConversion,
): Promise<SupportState> {
  const slug = fileSlugFor(conversion.from, conversion.to);

  const cached = resolved.get(slug);
  if (cached) return Promise.resolve(cached);

  const running = inFlight.get(slug);
  if (running) return running;

  const probe = runProbe(conversion)
    .catch(() =>
      unsupported(
        `${detectBrowserName()} cannot create ${conversion.to.label} files from ${conversion.from.label}.`,
      ),
    )
    .then((state) => {
      resolved.set(slug, state);
      inFlight.delete(slug);
      return state;
    });

  inFlight.set(slug, probe);
  return probe;
}

async function runProbe(conversion: FileConversion): Promise<SupportState> {
  const { to, engine } = conversion;

  switch (engine) {
    case "canvas":
    case "svg":
    case "heic":
    case "pdf-render":
      // pdf-render is pure wasm, but its output is still a canvas-encoded image.
      return (await canEncodeMime(to.mime))
        ? OK
        : unsupported(`${detectBrowserName()} cannot save ${to.label} images.`);
    case "pdf-build":
      return OK;
    case "media":
      return probeMedia(conversion);
  }
}

type Mediabunny = typeof import("mediabunny");

function outputFormatFor(container: MediaContainerId, mb: Mediabunny) {
  switch (container) {
    case "mp4":
      return new mb.Mp4OutputFormat();
    case "mov":
      return new mb.MovOutputFormat();
    case "mkv":
      return new mb.MkvOutputFormat();
    case "webm":
      return new mb.WebMOutputFormat();
    case "mp3":
      return new mb.Mp3OutputFormat();
    case "wav":
      return new mb.WavOutputFormat();
    case "ogg":
      return new mb.OggOutputFormat();
    case "flac":
      return new mb.FlacOutputFormat();
  }
}

async function probeMedia(conversion: FileConversion): Promise<SupportState> {
  const { to } = conversion;
  const media = to.media;
  if (!media) {
    return unsupported(`${to.label} cannot be written by this site.`);
  }

  // Loaded lazily so image-only pages never pay for the media library.
  const mb = await import("mediabunny");
  // MP3 encoding comes from an extension package, and this probe caches its
  // verdict, so the encoder has to be registered before anything is asked.
  const { prepareAudioEncoders } = await import("./converters/media");
  await prepareAudioEncoders(media.audioCodecs);
  const format = outputFormatFor(media.container, mb);

  if (to.kind === "video") {
    const supportedVideo = new Set(format.getSupportedVideoCodecs());
    const videoCandidates = (media.videoCodecs ?? []).filter((codec) =>
      supportedVideo.has(codec),
    );
    const videoCodec = videoCandidates.length
      ? await mb.getFirstEncodableVideoCodec(videoCandidates)
      : null;

    if (!videoCodec) {
      return unsupported(
        typeof VideoEncoder === "undefined"
          ? `${detectBrowserName()} does not support video encoding (WebCodecs).`
          : `${detectBrowserName()} cannot encode ${to.label} video.`,
      );
    }
    // A missing audio codec only costs the soundtrack, so it does not block.
    return OK;
  }

  const supportedAudio = new Set(format.getSupportedAudioCodecs());
  const audioCandidates = media.audioCodecs.filter((codec) =>
    supportedAudio.has(codec),
  );
  const audioCodec = audioCandidates.length
    ? await mb.getFirstEncodableAudioCodec(audioCandidates)
    : null;

  if (!audioCodec) {
    return unsupported(
      typeof AudioEncoder === "undefined"
        ? `${detectBrowserName()} does not support audio encoding (WebCodecs).`
        : `${detectBrowserName()} cannot encode ${to.label} audio.`,
    );
  }
  return OK;
}

/**
 * React hook: "checking" on first render, then the resolved state.
 *
 * The site is a static export, so the server cannot know what the visitor's
 * browser can do. Probing always starts in `useEffect` and the first render is
 * always "checking", which keeps server HTML and first client render identical.
 */
export function useConversionSupport(conversion: FileConversion): SupportState {
  const [state, setState] = useState<SupportState>(CHECKING);

  useEffect(() => {
    let cancelled = false;
    void probeConversion(conversion).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [conversion]);

  return state;
}

type TargetSupport = { sourceId: string; map: Map<string, SupportState> };

const EMPTY_TARGET_SUPPORT: TargetSupport = { sourceId: "", map: new Map() };

/**
 * React hook: support for every conversion out of `source`, keyed by target
 * format id. Probes run once per source, not once per render.
 */
export function useTargetSupport(
  source: FileFormat,
): Map<string, SupportState> {
  const [probed, setProbed] = useState<TargetSupport>(EMPTY_TARGET_SUPPORT);

  useEffect(() => {
    let cancelled = false;
    const sourceId = source.id;

    for (const conversion of getConversionsFrom(source)) {
      const targetId = conversion.to.id;
      void probeConversion(conversion).then((next) => {
        if (cancelled) return;
        setProbed((prev) => {
          const base =
            prev.sourceId === sourceId
              ? prev.map
              : new Map<string, SupportState>();
          if (base.get(targetId) === next && prev.sourceId === sourceId) {
            return prev;
          }
          const map = new Map(base);
          map.set(targetId, next);
          return { sourceId, map };
        });
      });
    }

    return () => {
      cancelled = true;
    };
  }, [source]);

  return useMemo(() => {
    const known = probed.sourceId === source.id ? probed.map : undefined;
    const map = new Map<string, SupportState>();
    for (const conversion of getConversionsFrom(source)) {
      map.set(conversion.to.id, known?.get(conversion.to.id) ?? CHECKING);
    }
    return map;
  }, [source, probed]);
}
