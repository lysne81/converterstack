"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatBytes, saveBlob } from "../../lib/files/download";
import type { MergePageSize } from "../../lib/files/pdf-merge";
import { addRecent } from "../../lib/recent";
import { KIND_STYLE } from "../ConverterCard";

type Item = {
  id: string;
  file: File;
  status: "reading" | "ready" | "error";
  pages?: number;
  error?: string;
};

const MAX_FILES = 50;

const PAGE_SIZES: { value: MergePageSize; label: string }[] = [
  { value: "first", label: "Same as the first page" },
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
  { value: "original", label: "Keep original sizes" },
];

/** Custom drag type, so reordering rows never mixes with dropping new files. */
const ROW_DRAG_TYPE = "application/x-converterstack-row";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Keep only characters that are safe in a file name on every OS. */
function safeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-");
  return `${cleaned || "merged"}.pdf`;
}

/**
 * Combine several PDFs into one, in a user-chosen order. Files are read with
 * the File API and joined with pdf-lib in the browser — nothing is uploaded.
 * Pages are copied rather than re-rendered, so text stays selectable and the
 * quality is untouched.
 */
export default function PdfMerger() {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragRowId, setDragRowId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("merged");
  const [pageSize, setPageSize] = useState<MergePageSize>("first");
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const dropHintId = useId();
  const privacyHintId = useId();
  const fileNameId = useId();
  const pageSizeId = useId();
  const pageSizeHintId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const counterRef = useRef(0);
  // After a move, the button that was pressed has travelled with its row;
  // focus is put back on it (or its sibling, if it just became disabled).
  const moveFocusRef = useRef<{ id: string; direction: -1 | 1 } | null>(null);
  const pdfLibRef = useRef<Promise<typeof import("../../lib/files/pdf-merge")> | null>(null);

  const theme = KIND_STYLE.file;

  useEffect(() => {
    addRecent({
      slug: "files/merge-pdf",
      fromLabel: "PDFs",
      toLabel: "one PDF",
    });
  }, []);

  useEffect(() => {
    const target = moveFocusRef.current;
    if (!target) return;
    moveFocusRef.current = null;
    const list = listRef.current;
    if (!list) return;
    const preferred = list.querySelector<HTMLButtonElement>(
      `[data-move="${target.id}:${target.direction}"]`,
    );
    const fallback = list.querySelector<HTMLButtonElement>(
      `[data-move="${target.id}:${-target.direction}"]`,
    );
    (preferred && !preferred.disabled ? preferred : fallback)?.focus();
  }, [items]);

  function pdfMerge() {
    pdfLibRef.current ??= import("../../lib/files/pdf-merge");
    return pdfLibRef.current;
  }

  function update(id: string, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addFiles(files: FileList | File[]) {
    const all = Array.from(files);
    const pdfs = all.filter(isPdf);
    setRejected(all.filter((file) => !isPdf(file)).map((file) => file.name));
    setMergeError(null);

    const room = Math.max(0, MAX_FILES - items.length);
    const added: Item[] = pdfs.slice(0, room).map((file) => ({
      id: `pdf-${counterRef.current++}`,
      file,
      status: "reading",
    }));
    if (added.length === 0) return;

    setItems((prev) => [...prev, ...added]);
    setAnnouncement(`${plural(added.length, "PDF")} added.`);

    // Reading each file up front shows its page count and catches damaged or
    // password-protected PDFs before the user presses Merge.
    for (const item of added) {
      pdfMerge()
        .then(({ countPdfPages }) => countPdfPages(item.file))
        .then((pages) => update(item.id, { status: "ready", pages }))
        .catch((error: unknown) => {
          const protectedPdf =
            error instanceof Error && error.name === "ProtectedPdfError";
          update(item.id, {
            status: "error",
            error: protectedPdf
              ? "Password-protected — it cannot be merged."
              : "Not a readable PDF — it may be damaged.",
          });
        });
    }
  }

  function move(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    moveFocusRef.current = { id, direction };
    setItems(next);
    setAnnouncement(
      `${items[index].file.name} moved to position ${target + 1} of ${items.length}.`,
    );
  }

  function moveTo(id: string, beforeId: string) {
    if (id === beforeId) return;
    setItems((prev) => {
      const moving = prev.find((item) => item.id === id);
      if (!moving) return prev;
      const rest = prev.filter((item) => item.id !== id);
      const at = rest.findIndex((item) => item.id === beforeId);
      const fromIndex = prev.findIndex((item) => item.id === id);
      const toIndex = prev.findIndex((item) => item.id === beforeId);
      // Dropping on a row further down places the file after it, which is
      // what the drag visually suggests.
      rest.splice(toIndex > fromIndex ? at + 1 : at, 0, moving);
      return rest;
    });
  }

  function remove(id: string) {
    const item = items.find((entry) => entry.id === id);
    setItems((prev) => prev.filter((entry) => entry.id !== id));
    if (item) setAnnouncement(`${item.file.name} removed.`);
  }

  function clear() {
    setItems([]);
    setRejected([]);
    setMergeError(null);
    setAnnouncement("File list cleared.");
  }

  async function merge() {
    const sources = items.filter((item) => item.status === "ready");
    if (sources.length < 2) return;
    setMerging(true);
    setProgress(0);
    setMergeError(null);
    setAnnouncement(`Merging ${plural(sources.length, "PDF")}…`);
    try {
      const { mergePdfs } = await pdfMerge();
      const merged = await mergePdfs(
        sources.map((item) => item.file),
        { pageSize, onProgress: setProgress },
      );
      const name = safeFileName(fileName);
      saveBlob(merged, name);
      setAnnouncement(`${name} is ready and downloading.`);
    } catch {
      setMergeError(
        "The PDFs could not be merged. Try removing the file that was added last.",
      );
      setAnnouncement("Merging failed.");
    } finally {
      setMerging(false);
    }
  }

  const ready = items.filter((item) => item.status === "ready");
  const reading = items.some((item) => item.status === "reading");
  const skipped = items.filter((item) => item.status === "error").length;
  const totalPages = ready.reduce((sum, item) => sum + (item.pages ?? 0), 0);
  const canMerge = ready.length >= 2 && !reading && !merging;
  const full = items.length >= MAX_FILES;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-labelledby={dropHintId}
        aria-describedby={privacyHintId}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes(ROW_DRAG_TYPE)) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={(e) => {
          if (e.dataTransfer.types.includes(ROW_DRAG_TYPE)) return;
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
            <path d="M8 3h7l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M4 7v12a2 2 0 0 0 2 2h9" />
            <path d="M12 9v6M9 12h6" />
          </svg>
        </span>
        <p id={dropHintId} className="text-sm font-medium">
          Drop PDF files here, or use the button below
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={full}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {items.length > 0 ? "Add more PDFs" : "Choose PDFs"}
          <span className="sr-only"> to merge</span>
        </button>
        <p
          id={privacyHintId}
          className="text-xs text-zinc-600 dark:text-zinc-400"
        >
          Merged on your device — your files are never uploaded.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          tabIndex={-1}
          aria-label="PDF files to merge"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>

      {rejected.length > 0 && (
        <p
          role="status"
          className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
        >
          <span aria-hidden>⚠ </span>
          {rejected.length === 1
            ? `${rejected[0]} is not a PDF and was left out.`
            : `${rejected.length} files are not PDFs and were left out.`}
        </p>
      )}

      {full && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You can merge up to {MAX_FILES} files at a time.
        </p>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pages are combined top to bottom. Drag a file, or use the arrows,
            to change the order.
          </p>

          <ol
            ref={listRef}
            aria-label="PDFs to merge, in order"
            className="flex flex-col gap-2"
          >
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(ROW_DRAG_TYPE, item.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragRowId(item.id);
                }}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(ROW_DRAG_TYPE)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData(ROW_DRAG_TYPE);
                  if (!id) return;
                  e.preventDefault();
                  moveTo(id, item.id);
                }}
                onDragEnd={() => setDragRowId(null)}
                className={`flex cursor-grab items-center gap-3 rounded-lg px-4 py-3 active:cursor-grabbing ${
                  dragRowId === item.id
                    ? "bg-blue-500/10 opacity-60"
                    : "bg-black/[.04] dark:bg-white/[.06]"
                }`}
              >
                <span
                  aria-hidden
                  className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-zinc-500 dark:text-zinc-400"
                >
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {item.status === "error" ? (
                      <span className="font-medium text-red-700 dark:text-red-400">
                        <span aria-hidden>⚠ </span>
                        Skipped: {item.error}
                      </span>
                    ) : (
                      <>
                        {formatBytes(item.file.size)}
                        {" · "}
                        {item.status === "reading"
                          ? "Reading…"
                          : plural(item.pages ?? 0, "page")}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    data-move={`${item.id}:-1`}
                    onClick={() => move(item.id, -1)}
                    disabled={index === 0}
                    className="rounded-full p-1.5 transition-colors hover:bg-black/[.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-30 dark:hover:bg-white/[.1]"
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                    <span className="sr-only">Move {item.file.name} up</span>
                  </button>
                  <button
                    type="button"
                    data-move={`${item.id}:1`}
                    onClick={() => move(item.id, 1)}
                    disabled={index === items.length - 1}
                    className="rounded-full p-1.5 transition-colors hover:bg-black/[.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-30 dark:hover:bg-white/[.1]"
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    <span className="sr-only">Move {item.file.name} down</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="ml-1 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/[.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/20 dark:hover:bg-white/[.1]"
                  >
                    Remove<span className="sr-only"> {item.file.name}</span>
                  </button>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-1 text-sm">
            <label htmlFor={pageSizeId} className="font-medium">
              Page size
            </label>
            <select
              id={pageSizeId}
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as MergePageSize)}
              aria-describedby={pageSizeHintId}
              className="h-10 rounded-lg border border-black/15 bg-white px-3 dark:border-white/20 dark:bg-zinc-950"
            >
              {PAGE_SIZES.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <p
              id={pageSizeHintId}
              className="text-zinc-600 dark:text-zinc-400"
            >
              {pageSize === "original"
                ? "Every page keeps its own size, so pages may look larger or smaller when you scroll."
                : "Pages are scaled to the same size and centred. Portrait and landscape pages keep their orientation, and text stays selectable."}
            </p>
          </div>

          <label
            htmlFor={fileNameId}
            className="flex flex-col gap-1 text-sm font-medium"
          >
            File name
            <span className="flex items-center gap-1">
              <input
                id={fileNameId}
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="merged"
                className="h-10 min-w-0 flex-1 rounded-lg border border-black/15 bg-white px-3 font-normal dark:border-white/20 dark:bg-zinc-950"
              />
              <span className="text-zinc-500 dark:text-zinc-400">.pdf</span>
            </span>
          </label>

          {merging && (
            <progress
              className="h-1.5 w-full accent-blue-600"
              max={1}
              value={progress > 0 ? progress : undefined}
              aria-label="Merging PDFs"
            />
          )}

          {mergeError && (
            <p
              role="alert"
              className="text-sm font-medium text-red-700 dark:text-red-400"
            >
              <span aria-hidden>⚠ </span>
              {mergeError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={merge}
              disabled={!canMerge}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            >
              {merging
                ? "Merging…"
                : ready.length >= 2
                  ? `Merge ${plural(ready.length, "PDF")} (${plural(totalPages, "page")}) and download`
                  : "Add at least two PDFs to merge"}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={merging}
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/[.08]"
            >
              Clear<span className="sr-only"> the file list</span>
            </button>
          </div>

          {skipped > 0 && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {plural(skipped, "file")} will be skipped because{" "}
              {skipped === 1 ? "it" : "they"} could not be read.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
