#!/usr/bin/env bash
set -euo pipefail

# The pdf.js worker is served as a plain static asset instead of being bundled:
# under `output: "export"` a bundler-relative `new URL(...)` worker reference
# does not survive the static export, so the file is copied verbatim into
# public/ and referenced as an absolute URL by the pdf-render engine.

src="node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
dest="public/pdf.worker.min.mjs"

if [ ! -f "$src" ]; then
  echo "error: $src not found — run npm install first." >&2
  exit 1
fi

mkdir -p public
cp "$src" "$dest"
echo "copied $src -> $dest"
