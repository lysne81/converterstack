"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  acceptFor,
  baseFileName,
  FORMAT_KIND_LABELS,
} from "../../lib/files/formats";
import {
  SOURCE_FORMATS,
  fileSlugFor,
  getConversionsFrom,
  getFileConversion,
  getFileConversions,
  getTargetsFor,
  conversionNotes,
  conversionTitle,
  describeFileConversion,
} from "../../lib/files/registry";
import { convertFile } from "../../lib/files/convert";
import {
  useConversionSupport,
  useTargetSupport,
} from "../../lib/files/support";
import { createZip } from "../../lib/files/zip";
import {
  DEFAULT_CONVERT_OPTIONS,
  type ConvertOptions,
  type ConvertOutput,
  type FileConversion,
  type FileFormat,
} from "../../lib/files/types";
import { addRecent } from "../../lib/recent";
import SwapButton from "../SwapButton";
import Combobox, { type ComboOption } from "../Combobox";
import ConverterCard, { KIND_STYLE } from "../ConverterCard";

/** Trigger reads "HEIC (.heic)"; the list adds the full format name. */
function comboOption(
  format: FileFormat,
  extra?: { disabled?: boolean; disabledNote?: string },
): ComboOption {
  return {
    id: format.id,
    symbol: format.label,
    detail: `(.${format.extensions[0]})`,
    label: format.name,
    meta: `${FORMAT_KIND_LABELS[format.kind]} · ${format.extensions
      .map((ext) => `.${ext}`)
      .join(", ")}`,
    keywords: [...format.extensions],
    ...extra,
  };
}

type Status = "pending" | "converting" | "done" | "error" | "cancelled";

type Item = {
  id: string;
  file: File;
  status: Status;
  /** Every file the engine produced — a PDF page split yields many. */
  outputs: ConvertOutput[];
  /** 0–1, only meaningful while converting. 0 means "not measurable yet". */
  progress: number;
  error?: string;
  /** True once the item has been handed to the queue at least once. Before
   * that it is only sitting in the list waiting for the user to press
   * "Convert" — nothing has been read or processed yet. */
  queued: boolean;
};

const MAX_FILES = 50;

/** Above this the browser has to hold a lot in memory, so we warn (not block). */
const LARGE_FILE_BYTES = 250 * 1024 * 1024;

/** Outputs listed before the "show all" affordance kicks in. */
const OUTPUT_PREVIEW = 8;

const SIZE_PRESETS = [
  { value: 0, label: "Original size" },
  { value: 4096, label: "Max 4096 px" },
  { value: 2048, label: "Max 2048 px" },
  { value: 1024, label: "Max 1024 px" },
  { value: 512, label: "Max 512 px" },
];

const AUDIO_BITRATES = [96_000, 128_000, 192_000, 256_000, 320_000];

const VIDEO_BITRATES = [1_000_000, 2_500_000, 4_000_000, 8_000_000, 16_000_000];

const HEIGHT_PRESETS = [
  { value: 0, label: "Original height" },
  { value: 2160, label: "2160p (4K)" },
  { value: 1080, label: "1080p" },
  { value: 720, label: "720p" },
  { value: 480, label: "480p" },
];

const DPI_PRESETS = [
  { value: 72, label: "72 DPI — screen" },
  { value: 96, label: "96 DPI" },
  { value: 150, label: "150 DPI — recommended" },
  { value: 200, label: "200 DPI" },
  { value: 300, label: "300 DPI — print" },
];

const PAGE_SIZES = [
  { value: "fit" as const, label: "Fit to image" },
  { value: "a4" as const, label: "A4 (210 × 297 mm)" },
  { value: "letter" as const, label: "Letter (8.5 × 11 in)" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/** Bits per second as the units people actually recognise. */
function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) {
    const mbps = bps / 1_000_000;
    return `${mbps % 1 === 0 ? mbps : mbps.toFixed(1)} Mbps`;
  }
  return `${Math.round(bps / 1000)} kbps`;
}

/** Assumed worst-case write speed when sizing the revoke delay. */
const DOWNLOAD_BYTES_PER_SECOND = 10 * 1024 * 1024;

const MIN_REVOKE_MS = 10_000;
const MAX_REVOKE_MS = 10 * 60_000;

/**
 * Revoking a `blob:` URL while the browser is still streaming it to disk
 * cancels the download, so the delay grows with the file: 10 s for a small
 * image, about a minute for a 500 MB video.
 */
function revokeDelay(bytes: number): number {
  const estimate =
    MIN_REVOKE_MS + (bytes / DOWNLOAD_BYTES_PER_SECOND) * 1_000;
  return Math.min(MAX_REVOKE_MS, estimate);
}

/**
 * Hand a blob to the browser as a download. The URL deliberately outlives the
 * component — clearing the list or navigating away must not kill a download in
 * progress — but every URL created here has exactly one revoke scheduled for
 * it, so nothing is leaked.
 */
function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), revokeDelay(blob.size));
}

function outputSize(item: Item): number {
  return item.outputs.reduce((sum, output) => sum + output.blob.size, 0);
}

/**
 * Batch file-format converter. Everything runs in the browser — files are read
 * with the File API and handed to the engine the conversion declares (canvas,
 * media or PDF), so nothing is ever uploaded.
 *
 * With `conversion` set the formats are locked (dedicated `/files/<slug>`
 * pages); without it the user picks both formats, as on the front page.
 */
export default function FileConverter({
  conversion,
  recordRecent = false,
}: {
  conversion?: FileConversion;
  recordRecent?: boolean;
} = {}) {
  const router = useRouter();
  const locked = conversion !== undefined;

  const [fromId, setFromId] = useState(conversion?.from.id ?? "heic");
  const [toId, setToId] = useState(conversion?.to.id ?? "jpg");

  const active =
    conversion ??
    getFileConversion(fromId, toId) ??
    getFileConversions().find((c) => c.from.id === fromId) ??
    getFileConversion("heic", "jpg")!;

  const { from, to } = active;

  const [options, setOptions] = useState<ConvertOptions>(
    DEFAULT_CONVERT_OPTIONS,
  );
  const [items, setItems] = useState<Item[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [stale, setStale] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [oversized, setOversized] = useState<string[]>([]);

  const fileInputId = useId();
  const dropHintId = useId();
  const privacyHintId = useId();
  const qualityId = useId();
  const resizeId = useId();
  const backgroundId = useId();
  const audioBitrateId = useId();
  const videoBitrateId = useId();
  const maxHeightId = useId();
  const dpiId = useId();
  const pageSizeId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  // Result rows and their "show all outputs" lists, so focus can be parked on
  // something stable when the control that had it is removed from the DOM.
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const outputListRefs = useRef(new Map<string, HTMLUListElement>());
  // Item whose Cancel button currently has focus, and the item whose output
  // list was just expanded — both are focus hand-offs, not rendering state.
  const cancelFocusRef = useRef<string | null>(null);
  const expandFocusRef = useRef<string | null>(null);
  // Conversions run one at a time so a large batch cannot exhaust memory.
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const counterRef = useRef(0);
  // Bumped whenever queued work becomes obsolete (clear, re-run, unmount) so
  // in-flight conversions cannot resurrect results for items that are gone.
  const genRef = useRef(0);
  // One controller per item, so the user can abort a long encode by hand. The
  // generation token still handles clear/re-run/unmount.
  const abortRef = useRef(new Map<string, AbortController>());
  // Last progress value pushed into React, used to throttle re-renders.
  const progressRef = useRef(new Map<string, number>());

  useEffect(() => {
    const generation = genRef;
    const controllers = abortRef.current;
    return () => {
      generation.current++;
      for (const controller of controllers.values()) controller.abort();
      controllers.clear();
    };
  }, []);

  const support = useConversionSupport(active);
  const targetSupport = useTargetSupport(from);

  // A Cancel button disappears the moment its file finishes, fails or is
  // cancelled. If it held focus, focus would fall back to <body> and the
  // keyboard user would lose their place, so it is moved to the row instead —
  // which also lets a screen reader read the new state of that file.
  useEffect(() => {
    const id = cancelFocusRef.current;
    if (id === null) return;
    const item = items.find((entry) => entry.id === id);
    const cancellable =
      item?.status === "pending" || item?.status === "converting";
    if (cancellable) return;
    cancelFocusRef.current = null;
    // Only step in when nothing else claimed focus (e.g. the user tabbed away
    // or pressed "Clear" themselves).
    const activeElement = document.activeElement;
    if (activeElement !== null && activeElement !== document.body) return;
    rowRefs.current.get(id)?.focus();
  }, [items]);

  // "Show all N files" removes itself, so hand focus to the list it revealed.
  useEffect(() => {
    const id = expandFocusRef.current;
    if (id === null) return;
    expandFocusRef.current = null;
    outputListRefs.current.get(id)?.focus();
  }, [expanded]);

  useEffect(() => {
    if (!recordRecent) return;
    addRecent({
      slug: `files/${fileSlugFor(from, to)}`,
      fromLabel: from.label,
      toLabel: to.label,
    });
  }, [recordRecent, from, to]);

  const sourceOptions = useMemo(
    () => SOURCE_FORMATS.map((format) => comboOption(format)),
    [],
  );

  // Unsupported targets stay in the list but are disabled, so people can see
  // that the conversion exists and that it is their browser saying no.
  const targetOptions = useMemo(
    () =>
      getTargetsFor(from).map((format) => {
        const state = targetSupport.get(format.id);
        return comboOption(
          format,
          state?.state === "unsupported"
            ? { disabled: true, disabledNote: "not supported in this browser" }
            : undefined,
        );
      }),
    [from, targetSupport],
  );

  // Conversions out of the same source that this device can actually run.
  // They are the recovery path offered when the requested one is unsupported,
  // so they are whole conversions rather than bare target formats.
  const alternatives = useMemo(
    () =>
      getConversionsFrom(from).filter(
        (candidate) =>
          candidate.to.id !== to.id &&
          targetSupport.get(candidate.to.id)?.state === "ok",
      ),
    [from, to.id, targetSupport],
  );

  function update(id: string, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function run(
    item: Item,
    controller: AbortController,
    target: FileConversion,
    settings: ConvertOptions,
  ) {
    const generation = genRef.current;
    queueRef.current = queueRef.current.then(async () => {
      // The controller is passed in rather than looked up by id: a re-run
      // reuses the item ids, so a lookup could hand this task — or its
      // cleanup — the controller belonging to the run that replaced it.
      if (genRef.current !== generation) return;

      try {
        if (controller.signal.aborted) return;

        progressRef.current.set(item.id, 0);
        update(item.id, { status: "converting", progress: 0 });

        const result = await convertFile({
          file: item.file,
          fileName: item.file.name,
          conversion: target,
          options: settings,
          signal: controller.signal,
          // A minutes-long encode can report thousands of times; only let a
          // whole percentage point through so React is not thrashed.
          onProgress: (fraction) => {
            if (genRef.current !== generation) return;
            const value = Math.min(1, Math.max(0, fraction));
            const last = progressRef.current.get(item.id) ?? 0;
            if (value < 1 && value - last < 0.01) return;
            progressRef.current.set(item.id, value);
            update(item.id, { progress: value });
          },
        });
        if (genRef.current !== generation) return;
        if (controller.signal.aborted) {
          update(item.id, { status: "cancelled", outputs: [], progress: 0 });
          return;
        }
        update(item.id, {
          status: "done",
          outputs: result.outputs,
          progress: 1,
          error: undefined,
        });
      } catch (error) {
        if (genRef.current !== generation) return;
        if (controller.signal.aborted) {
          update(item.id, { status: "cancelled", outputs: [], progress: 0 });
          return;
        }
        update(item.id, {
          status: "error",
          outputs: [],
          progress: 0,
          error:
            error instanceof Error
              ? error.message
              : "This file could not be converted.",
        });
      } finally {
        // Only tidy up after ourselves — anything keyed by this id now may
        // belong to a newer run of the same item.
        if (abortRef.current.get(item.id) === controller) {
          abortRef.current.delete(item.id);
          progressRef.current.delete(item.id);
        }
      }
    });
  }

  function start(batch: Item[]) {
    if (batch.length === 0) return;
    const controllers = batch.map((item) => {
      const controller = new AbortController();
      abortRef.current.set(item.id, controller);
      return controller;
    });
    const ids = new Set(batch.map((item) => item.id));
    setItems((prev) =>
      prev.map((item) => (ids.has(item.id) ? { ...item, queued: true } : item)),
    );
    batch.forEach((item, index) =>
      run(item, controllers[index], active, options),
    );
  }

  function addFiles(files: FileList | File[]) {
    const room = Math.max(0, MAX_FILES - items.length);
    const incoming = Array.from(files).slice(0, room);
    if (incoming.length === 0) return;

    const added: Item[] = incoming.map((file) => ({
      id: `item-${counterRef.current++}`,
      file,
      status: "pending",
      outputs: [],
      progress: 0,
      queued: false,
    }));

    setItems((prev) => [...prev, ...added]);
    setOversized(
      incoming
        .filter((file) => file.size > LARGE_FILE_BYTES)
        .map((file) => file.name),
    );
    // Existing items still carry the settings they were converted with, so the
    // "apply new settings" prompt must survive adding more files.
    if (items.length === 0) setStale(false);
    // Conversion no longer starts automatically — the files just sit here as
    // "pending, not queued" until the user presses the Convert button below.
  }

  /** Kicks off conversion for every added file that hasn't been queued yet. */
  function convertReady() {
    start(items.filter((item) => !item.queued));
  }

  function reconvert() {
    // Only re-run files that were already queued once — freshly added files
    // that are still waiting on the Convert button will pick up the current
    // settings the first time they run, so they don't need "reapplying".
    const retryIds = new Set(
      items.filter((item) => item.queued).map((item) => item.id),
    );
    if (retryIds.size === 0) {
      setStale(false);
      return;
    }
    setStale(false);
    genRef.current++;
    for (const controller of abortRef.current.values()) controller.abort();
    abortRef.current.clear();
    const nextItems = items.map((item) =>
      retryIds.has(item.id)
        ? {
            ...item,
            status: "pending" as const,
            outputs: [],
            progress: 0,
            error: undefined,
          }
        : item,
    );
    setItems(nextItems);
    setExpanded([]);
    start(nextItems.filter((item) => retryIds.has(item.id)));
  }

  function cancelItem(id: string) {
    const controller = abortRef.current.get(id);
    if (controller) {
      controller.abort();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id && item.status !== "done" && item.status !== "error"
            ? { ...item, status: "cancelled", outputs: [], progress: 0 }
            : item,
        ),
      );
      return;
    }
    // Never queued — there is nothing running to cancel, so just remove it.
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function changeOptions<K extends keyof ConvertOptions>(
    group: K,
    patch: Partial<ConvertOptions[K]>,
  ) {
    setOptions((prev) => ({ ...prev, [group]: { ...prev[group], ...patch } }));
    // Only files that have already been converted once need "reapplying" —
    // files still waiting on the Convert button will use these settings the
    // first time they run.
    if (items.some((item) => item.queued)) setStale(true);
  }

  function clearItems() {
    genRef.current++;
    for (const controller of abortRef.current.values()) controller.abort();
    abortRef.current.clear();
    progressRef.current.clear();
    setItems([]);
    setExpanded([]);
    setOversized([]);
    setStale(false);
  }

  function changeFrom(nextId: string) {
    setFromId(nextId);
    if (!getFileConversion(nextId, toId)) {
      const fallback = getFileConversions().find((c) => c.from.id === nextId);
      if (fallback) setToId(fallback.to.id);
    }
    clearItems();
  }

  function changeTo(nextId: string) {
    setToId(nextId);
    if (!getFileConversion(fromId, nextId)) {
      const fallback = getFileConversions().find((c) => c.to.id === nextId);
      if (fallback) setFromId(fallback.from.id);
    }
    clearItems();
  }

  function handleSwap() {
    const reverse = getFileConversion(to.id, from.id);
    if (!reverse) return;
    if (locked) {
      router.push(`/files/${fileSlugFor(to, from)}`);
      return;
    }
    setFromId(to.id);
    setToId(from.id);
    clearItems();
  }

  async function downloadZip(entries: ConvertOutput[], name: string) {
    if (entries.length === 0) return;
    setZipping(true);
    try {
      const zip = await createZip(
        entries.map((output) => ({ name: output.name, blob: output.blob })),
      );
      saveBlob(zip, name);
    } finally {
      setZipping(false);
    }
  }

  const allOutputs = items.flatMap((item) => item.outputs);
  const doneCount = items.filter((item) => item.status === "done").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const queuedCount = items.filter((item) => item.queued).length;
  const readyCount = items.length - queuedCount;
  const busy = items.some(
    (item) =>
      (item.status === "pending" && item.queued) ||
      item.status === "converting",
  );
  const swappable = getFileConversion(to.id, from.id) !== null;
  const notes = conversionNotes(active);
  const theme = KIND_STYLE.file;
  const qualityPercent = Math.round(options.image.quality * 100);

  // "checking" is treated as neutral so the page never flashes an error while
  // the codec probes are still running.
  const blockedReason =
    support.state === "unsupported" ? support.reason : null;
  // When this device cannot run the conversion, every control that exists to
  // convert something is hidden — offering settings and a file picker for a
  // conversion that can only fail is worse than offering nothing.
  const blocked = blockedReason !== null;

  // Which option groups are relevant follows from the two format kinds.
  const showQuality = to.kind === "image" && Boolean(to.lossy);
  const showBackground =
    to.kind === "image" &&
    !to.alpha &&
    (Boolean(from.alpha) || from.kind === "document");
  const showResize =
    from.kind === "image" && (to.kind === "image" || to.kind === "document");
  const showAudio = to.kind === "audio";
  const showVideo = from.kind === "video" && to.kind === "video";
  const showDpi = from.kind === "document" && to.kind === "image";
  const showPageSize = to.kind === "document";
  const hasOptions =
    showQuality ||
    showBackground ||
    showResize ||
    showAudio ||
    showVideo ||
    showDpi ||
    showPageSize;

  const plural = (n: number) => (n === 1 ? "" : "s");

  // A single summary for the whole batch: the text is identical for every
  // per-file update while work is running, so a screen reader announces once
  // when the batch starts and once when it settles instead of 50 times. Per-item
  // progress deliberately stays out of it.
  const announcement = blocked
    ? // Routed through the persistent live region rather than announced by the
      // panel itself: a region that only mounts once it has something to say is
      // not reliably read out.
      `${conversionTitle(active)} is not supported on this device. ${blockedReason}`
    : items.length === 0
      ? ""
      : busy
        ? `Converting ${queuedCount} file${plural(queuedCount)} to ${to.label}.`
        : queuedCount === 0
          ? // Nothing has been converted yet — the files are just waiting on
            // the Convert button.
            `${readyCount} file${plural(readyCount)} added. Press Convert to start.`
          : `${doneCount} of ${queuedCount} file${plural(queuedCount)} converted to ${to.label}` +
            (errorCount > 0
              ? `. ${errorCount} file${plural(errorCount)} failed — see the list for details.`
              : // Promising download links when nothing succeeded (everything
                // was cancelled) would send a screen-reader user looking for
                // controls that are not there.
                doneCount > 0
                ? ". Download links are ready."
                : ".") +
            (readyCount > 0
              ? ` ${readyCount} more file${plural(readyCount)} added — press Convert to start.`
              : "");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {locked ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
            <span>From</span>
            <div className="flex h-11 items-center truncate rounded-lg border border-black/10 bg-black/[.03] px-3 text-base dark:border-white/15 dark:bg-white/[.04]">
              {from.label} (.{from.extensions[0]})
            </div>
          </div>
        ) : (
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
            From
            <Combobox
              label="From — source format"
              value={from.id}
              options={sourceOptions}
              onChange={changeFrom}
              placeholder="Select format"
              searchPlaceholder="Search formats…"
              searchLabel="Search source formats"
              emptyLabel="No formats match"
            />
          </label>
        )}

        <div className="flex justify-center sm:pb-1">
          {swappable && (
            <SwapButton
              onClick={handleSwap}
              label={`Swap formats — convert ${to.label} to ${from.label} instead`}
              title={`Swap to ${to.label} → ${from.label}`}
            />
          )}
        </div>

        {locked ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
            <span>To</span>
            <div className="flex h-11 items-center truncate rounded-lg border border-black/10 bg-black/[.03] px-3 text-base dark:border-white/15 dark:bg-white/[.04]">
              {to.label} (.{to.extensions[0]})
            </div>
          </div>
        ) : (
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
            To
            <Combobox
              label="To — target format"
              value={to.id}
              options={targetOptions}
              onChange={changeTo}
              placeholder="Select format"
              searchPlaceholder="Search formats…"
              searchLabel="Search target formats"
              emptyLabel="No formats match"
            />
          </label>
        )}
      </div>

      {blocked && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              <span aria-hidden>⚠ </span>
              {conversionTitle(active)} is not supported on this device
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {blockedReason}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Files are converted entirely on your device, so this conversion
              depends on what this browser can encode. It may work in a
              different browser or on another device.
            </p>
          </div>

          {alternatives.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">
                {from.label} conversions that work on this device
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {alternatives.map((candidate) => (
                  <li key={fileSlugFor(candidate.from, candidate.to)}>
                    <ConverterCard
                      href={`/files/${fileSlugFor(candidate.from, candidate.to)}`}
                      kind="file"
                      eyebrow="File"
                      title={conversionTitle(candidate)}
                      subtitle={describeFileConversion(candidate)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No other {from.label} conversions run on this device either.{" "}
              <Link
                href="/files"
                className="rounded font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Browse all file converters
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {!blocked && (hasOptions || notes.length > 0) ? (
        <details className="rounded-lg border border-black/10 px-4 py-3 dark:border-white/15">
          <summary className="cursor-pointer rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Advanced options
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            {showDpi && (
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor={dpiId} className="font-medium">
                  Render resolution
                </label>
                <select
                  id={dpiId}
                  value={options.document.dpi}
                  onChange={(e) =>
                    changeOptions("document", { dpi: Number(e.target.value) })
                  }
                  className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
                >
                  {DPI_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showQuality && (
              <div className="flex flex-col gap-1 text-sm">
                <span className="flex items-center justify-between font-medium">
                  <label htmlFor={qualityId}>Quality</label>
                  <span aria-hidden className="tabular-nums">
                    {qualityPercent}%
                  </span>
                </span>
                <input
                  id={qualityId}
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={qualityPercent}
                  aria-valuetext={`${qualityPercent} percent`}
                  onChange={(e) =>
                    changeOptions("image", {
                      quality: Number(e.target.value) / 100,
                    })
                  }
                  className="accent-blue-600"
                />
              </div>
            )}

            {showResize && (
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor={resizeId} className="font-medium">
                  {from.id === "svg" ? "Render size" : "Resize"}
                </label>
                <select
                  id={resizeId}
                  value={options.image.maxSize ?? 0}
                  onChange={(e) =>
                    changeOptions("image", {
                      maxSize: Number(e.target.value) || undefined,
                    })
                  }
                  className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
                >
                  {SIZE_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showBackground && (
              <div className="flex items-center gap-3 text-sm">
                <label htmlFor={backgroundId} className="font-medium">
                  Background for transparency
                </label>
                <input
                  id={backgroundId}
                  type="color"
                  value={options.image.background}
                  onChange={(e) =>
                    changeOptions("image", { background: e.target.value })
                  }
                  className="h-8 w-12 cursor-pointer rounded border border-black/15 dark:border-white/20"
                />
              </div>
            )}

            {showPageSize && (
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor={pageSizeId} className="font-medium">
                  Page size
                </label>
                <select
                  id={pageSizeId}
                  value={options.document.pageSize}
                  onChange={(e) =>
                    changeOptions("document", {
                      pageSize: e.target
                        .value as ConvertOptions["document"]["pageSize"],
                    })
                  }
                  className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
                >
                  {PAGE_SIZES.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showAudio &&
              (to.lossy ? (
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor={audioBitrateId} className="font-medium">
                    Audio bitrate
                  </label>
                  <select
                    id={audioBitrateId}
                    value={options.audio.bitrate}
                    onChange={(e) =>
                      changeOptions("audio", {
                        bitrate: Number(e.target.value),
                      })
                    }
                    className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
                  >
                    {AUDIO_BITRATES.map((bitrate) => (
                      <option key={bitrate} value={bitrate}>
                        {formatBitrate(bitrate)}
                        {bitrate === 192_000 ? " — recommended" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {to.label} is lossless, so there is no bitrate to choose — the
                  audio is stored at full quality.
                </p>
              ))}

            {showVideo && (
              <>
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor={videoBitrateId} className="font-medium">
                    Video bitrate
                  </label>
                  <select
                    id={videoBitrateId}
                    value={options.video.bitrate}
                    onChange={(e) =>
                      changeOptions("video", {
                        bitrate: Number(e.target.value),
                      })
                    }
                    className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
                  >
                    {VIDEO_BITRATES.map((bitrate) => (
                      <option key={bitrate} value={bitrate}>
                        {formatBitrate(bitrate)}
                        {bitrate === 4_000_000 ? " — recommended" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor={maxHeightId} className="font-medium">
                    Maximum height
                  </label>
                  <select
                    id={maxHeightId}
                    value={options.video.maxHeight ?? 0}
                    onChange={(e) =>
                      changeOptions("video", {
                        maxHeight: Number(e.target.value) || undefined,
                      })
                    }
                    className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
                  >
                    {HEIGHT_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Files whose codec {to.label} already supports are repackaged
                  losslessly and ignore both settings.
                </p>
              </>
            )}

            {notes.length > 0 && (
              <ul className="flex list-disc flex-col gap-1 border-t border-black/10 pl-5 pt-3 text-xs text-zinc-600 dark:border-white/15 dark:text-zinc-400">
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ) : null}

      {!blocked && (
        <div
          role="group"
          aria-labelledby={dropHintId}
          aria-describedby={privacyHintId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            // Ignore the leave events fired when moving across child elements.
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setDragging(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-blue-500 bg-blue-500/5"
              : "border-black/15 bg-black/[.02] dark:border-white/20 dark:bg-white/[.03]"
          }`}
        >
          <span className={theme.text}>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </span>
          <p id={dropHintId} className="text-sm font-medium">
            Drop {from.label} files here, or use the button below
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Choose files
            <span className="sr-only">
              {" "}
              to convert from {from.label} to {to.label}
            </span>
          </button>
          <p
            id={privacyHintId}
            className="text-xs text-zinc-600 dark:text-zinc-400"
          >
            Converted on your device — your files are never uploaded.
          </p>
          <input
            ref={inputRef}
            id={fileInputId}
            type="file"
            multiple
            tabIndex={-1}
            aria-label={`${from.label} files to convert`}
            accept={acceptFor(from)}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>

      {!blocked && oversized.length > 0 && (
        <p
          role="status"
          className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
        >
          <span aria-hidden>⚠ </span>
          {oversized.length === 1
            ? `${oversized[0]} is larger than ${formatBytes(LARGE_FILE_BYTES)}.`
            : `${oversized.length} files are larger than ${formatBytes(LARGE_FILE_BYTES)}.`}{" "}
          Converting in the browser may take several minutes and use a lot of
          memory — keep this tab open.
        </p>
      )}

      {!blocked && readyCount > 0 && (
        <button
          type="button"
          onClick={convertReady}
          className="w-fit rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Convert {readyCount} file{plural(readyCount)}
          <span className="sr-only"> to {to.label}</span>
        </button>
      )}

      {!blocked && stale && queuedCount > 0 && (
        <button
          type="button"
          onClick={reconvert}
          className="w-fit rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/20 dark:hover:bg-white/[.08]"
        >
          Apply new settings to {queuedCount} file
          {plural(queuedCount)}
        </button>
      )}

      {!blocked && items.length > 0 && (
        <div className="flex flex-col gap-2">
          <ul
            className="flex flex-col gap-2"
            aria-label="Selected files"
            aria-busy={busy}
          >
            {items.map((item) => {
              const single = item.outputs.length === 1 ? item.outputs[0] : null;
              const many = item.outputs.length > 1;
              const showAll = expanded.includes(item.id);
              const visible = showAll
                ? item.outputs
                : item.outputs.slice(0, OUTPUT_PREVIEW);

              return (
                <li
                  key={item.id}
                  ref={(el) => {
                    if (el) rowRefs.current.set(item.id, el);
                    else rowRefs.current.delete(item.id);
                  }}
                  tabIndex={-1}
                  className="flex flex-col gap-2 rounded-lg bg-black/[.04] px-4 py-3 dark:bg-white/[.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {single ? single.name : item.file.name}
                      </span>
                      <span className="min-w-0 break-words text-xs text-zinc-600 dark:text-zinc-400">
                        {item.status === "done" && item.outputs.length > 0 ? (
                          <>
                            {formatBytes(item.file.size)} →{" "}
                            <span className={theme.text}>
                              {formatBytes(outputSize(item))}
                            </span>
                            {many
                              ? ` · ${item.outputs.length} files`
                              : single?.width && single.height
                                ? ` · ${single.width}×${single.height}`
                                : ""}
                          </>
                        ) : item.status === "error" ? (
                          // Prefixed with a word and a symbol so the failure is
                          // not signalled by colour alone.
                          <span className="font-medium text-red-700 dark:text-red-400">
                            <span aria-hidden>⚠ </span>
                            Failed: {item.error}
                          </span>
                        ) : item.status === "cancelled" ? (
                          "Cancelled"
                        ) : item.status === "converting" ? (
                          item.progress > 0 ? (
                            `Converting… ${Math.round(item.progress * 100)}%`
                          ) : (
                            "Converting…"
                          )
                        ) : item.queued ? (
                          "Waiting…"
                        ) : (
                          "Ready to convert"
                        )}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {(item.status === "pending" ||
                        item.status === "converting") && (
                        <button
                          type="button"
                          onClick={() => cancelItem(item.id)}
                          onFocus={() => {
                            cancelFocusRef.current = item.id;
                          }}
                          onBlur={() => {
                            if (cancelFocusRef.current === item.id) {
                              cancelFocusRef.current = null;
                            }
                          }}
                          className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/[.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/20 dark:hover:bg-white/[.1]"
                        >
                          {item.queued ? "Cancel" : "Remove"}
                          <span className="sr-only"> {item.file.name}</span>
                        </button>
                      )}
                      {single && (
                        <button
                          type="button"
                          onClick={() => saveBlob(single.blob, single.name)}
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Download<span className="sr-only"> {single.name}</span>
                        </button>
                      )}
                      {many && (
                        <button
                          type="button"
                          onClick={() =>
                            downloadZip(
                              item.outputs,
                              `${baseFileName(item.file.name)}.zip`,
                            )
                          }
                          disabled={zipping}
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
                        >
                          Download .zip
                          <span className="sr-only">
                            {" "}
                            — all {item.outputs.length} files from{" "}
                            {item.file.name}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {item.status === "converting" && (
                    // Engines that cannot measure progress leave `progress` at
                    // 0 until the very end, which renders as indeterminate.
                    <progress
                      className="h-1.5 w-full accent-blue-600"
                      max={1}
                      value={item.progress > 0 ? item.progress : undefined}
                      aria-label={`Converting ${item.file.name}`}
                    />
                  )}

                  {many && (
                    <details className="text-xs">
                      <summary className="cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        {item.outputs.length} files from {item.file.name}
                      </summary>
                      <ul
                        ref={(el) => {
                          if (el) outputListRefs.current.set(item.id, el);
                          else outputListRefs.current.delete(item.id);
                        }}
                        tabIndex={-1}
                        aria-label={`Files converted from ${item.file.name}`}
                        className="mt-2 flex flex-col gap-1"
                      >
                        {visible.map((output) => (
                          <li
                            key={output.name}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="truncate text-zinc-600 dark:text-zinc-400">
                              {output.name} · {formatBytes(output.blob.size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => saveBlob(output.blob, output.name)}
                              className="shrink-0 rounded-full border border-black/15 px-2.5 py-1 font-medium transition-colors hover:bg-black/[.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/20 dark:hover:bg-white/[.1]"
                            >
                              Download
                              <span className="sr-only"> {output.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {!showAll && item.outputs.length > OUTPUT_PREVIEW && (
                        <button
                          type="button"
                          onClick={() => {
                            expandFocusRef.current = item.id;
                            setExpanded((prev) => [...prev, item.id]);
                          }}
                          className="mt-2 rounded font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Show all {item.outputs.length} files
                        </button>
                      )}
                    </details>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-2">
            {allOutputs.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  downloadZip(
                    allOutputs,
                    `converted-${from.id}-to-${to.id}.zip`,
                  )
                }
                disabled={zipping || busy}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
              >
                {zipping
                  ? "Packing…"
                  : `Download all (${allOutputs.length}) as .zip`}
              </button>
            )}
            <button
              type="button"
              onClick={clearItems}
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/20 dark:hover:bg-white/[.08]"
            >
              Clear<span className="sr-only"> the file list</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
