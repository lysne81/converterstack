/**
 * A minimal ZIP writer used for the "Download all" button.
 *
 * Uses the browser's built-in `CompressionStream("deflate-raw")` when it is
 * available and falls back to storing files uncompressed, so no dependency is
 * needed. Only 32-bit (< 4 GB) archives are produced, which is far beyond what
 * a browser-side batch will ever reach.
 */

export type ZipEntry = { name: string; blob: Blob };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream !== "function") return null;
  try {
    const stream = new Blob([bytes as BlobPart])
      .stream()
      .pipeThrough(new CompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

/** DOS date/time as used by the ZIP header. */
function dosDateTime(date: Date): { time: number; date: number } {
  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      (Math.floor(date.getSeconds() / 2) & 0x1f),
    date:
      ((date.getFullYear() - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

/** Ensure every entry gets a unique name so nothing is silently overwritten. */
function uniqueNames(entries: ZipEntry[]): string[] {
  const used = new Set<string>();
  return entries.map(({ name }) => {
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
    const dot = name.lastIndexOf(".");
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    let counter = 1;
    let candidate = `${stem} (${counter})${ext}`;
    while (used.has(candidate)) {
      counter++;
      candidate = `${stem} (${counter})${ext}`;
    }
    used.add(candidate);
    return candidate;
  });
}

export async function createZip(entries: ZipEntry[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const names = uniqueNames(entries);
  const { time, date } = dosDateTime(new Date());

  const parts: BlobPart[] = [];
  const central: BlobPart[] = [];
  let offset = 0;

  for (let i = 0; i < entries.length; i++) {
    const nameBytes = encoder.encode(names[i]);
    const raw = new Uint8Array(await entries[i].blob.arrayBuffer());
    const crc = crc32(raw);

    const deflated = await deflateRaw(raw);
    const useDeflate = deflated !== null && deflated.length < raw.length;
    const data = useDeflate ? deflated! : raw;
    const method = useDeflate ? 8 : 0;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, method, true);
    local.setUint16(10, time, true);
    local.setUint16(12, date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, raw.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true); // extra field length

    parts.push(local.buffer, nameBytes as BlobPart, data as BlobPart);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true); // version made by
    entry.setUint16(6, 20, true); // version needed
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, method, true);
    entry.setUint16(12, time, true);
    entry.setUint16(14, date, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, raw.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, offset, true);

    central.push(entry.buffer, nameBytes as BlobPart);
    offset += 30 + nameBytes.length + data.length;
  }

  const centralSize = central.reduce(
    (sum: number, part) => sum + (part as ArrayBuffer | Uint8Array).byteLength,
    0,
  );

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...parts, ...central, end.buffer], {
    type: "application/zip",
  });
}
