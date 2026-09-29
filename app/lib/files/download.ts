/** Human-readable file size, e.g. "4.2 MB". */
export function formatBytes(bytes: number): string {
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
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), revokeDelay(blob.size));
}
