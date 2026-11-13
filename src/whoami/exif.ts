/**
 * Minimal EXIF reader for JPEG files. Runs entirely in the browser on the
 * bytes of a file the visitor picks; nothing is uploaded. Only the tags the
 * photo-metadata demo shows are decoded.
 */

export interface PhotoMeta {
  make?: string;
  model?: string;
  lens?: string;
  software?: string;
  artist?: string;
  copyright?: string;
  serial?: string;
  uniqueId?: string;
  takenAt?: string;
  offset?: string;
  width?: number;
  height?: number;
  fNumber?: number;
  exposure?: string;
  iso?: number;
  focalLength?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  direction?: number;
  gpsAccuracy?: number;
  /** Embedded preview JPEG; can show the photo as it was before cropping or editing. */
  thumbnail?: Blob;
  /** Number of tags found in total, a rough "how much is in here" measure. */
  tagCount: number;
}

type Raw = string | number | number[] | Uint8Array;
type Ifd = Map<number, Raw>;

const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

/** Returns undefined when the file is not a JPEG or carries no EXIF block. */
export function readExif(buffer: ArrayBuffer): PhotoMeta | undefined {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return undefined;

  let pos = 2;
  while (pos + 4 <= view.byteLength) {
    if (view.getUint8(pos) !== 0xff) return undefined;
    const marker = view.getUint8(pos + 1);
    if (marker === 0xda || marker === 0xd9) return undefined; // image data starts, no EXIF before it
    const length = view.getUint16(pos + 2);
    if (marker === 0xe1 && length >= 8 && readAscii(view, pos + 4, 4) === "Exif") {
      return parseTiff(new DataView(buffer, pos + 10, length - 8));
    }
    pos += 2 + length;
  }
  return undefined;
}

function readAscii(view: DataView, start: number, length: number) {
  let out = "";
  for (let i = 0; i < length && start + i < view.byteLength; i++) {
    const c = view.getUint8(start + i);
    if (c === 0) break;
    out += String.fromCharCode(c);
  }
  return out;
}

function parseTiff(tiff: DataView): PhotoMeta | undefined {
  if (tiff.byteLength < 8) return undefined;
  const le = tiff.getUint16(0) === 0x4949;
  const u16 = (o: number) => tiff.getUint16(o, le);
  const u32 = (o: number) => tiff.getUint32(o, le);
  const i32 = (o: number) => tiff.getInt32(o, le);
  let tagCount = 0;

  function readIfd(offset: number): { ifd: Ifd; next: number } {
    const ifd: Ifd = new Map();
    if (offset <= 0 || offset + 2 > tiff.byteLength) return { ifd, next: 0 };
    const count = u16(offset);
    for (let i = 0; i < count; i++) {
      const entry = offset + 2 + i * 12;
      if (entry + 12 > tiff.byteLength) break;
      const tag = u16(entry);
      const type = u16(entry + 2);
      const n = u32(entry + 4);
      const size = (TYPE_SIZE[type] ?? 0) * n;
      if (!size) continue;
      const at = size <= 4 ? entry + 8 : u32(entry + 8);
      if (at + size > tiff.byteLength) continue;
      tagCount++;
      ifd.set(tag, readValue(type, at, n));
    }
    const nextAt = offset + 2 + count * 12;
    return { ifd, next: nextAt + 4 <= tiff.byteLength ? u32(nextAt) : 0 };
  }

  function readValue(type: number, at: number, n: number): Raw {
    switch (type) {
      case 2:
        return readAscii(tiff, at, n).trim();
      case 1:
      case 7:
        return new Uint8Array(tiff.buffer, tiff.byteOffset + at, n);
      case 3:
      case 4:
      case 9: {
        const vals = Array.from({ length: n }, (_, i) =>
          type === 3 ? u16(at + i * 2) : type === 4 ? u32(at + i * 4) : i32(at + i * 4),
        );
        return n === 1 ? vals[0] : vals;
      }
      case 5:
      case 10: {
        const vals = Array.from({ length: n }, (_, i) => {
          const num = type === 5 ? u32(at + i * 8) : i32(at + i * 8);
          const den = type === 5 ? u32(at + i * 8 + 4) : i32(at + i * 8 + 4);
          return den === 0 ? 0 : num / den;
        });
        return n === 1 ? vals[0] : vals;
      }
      default:
        return 0;
    }
  }

  const str = (ifd: Ifd, tag: number) => {
    const v = ifd.get(tag);
    return typeof v === "string" && v ? v : undefined;
  };
  const num = (ifd: Ifd, tag: number) => {
    const v = ifd.get(tag);
    const n = Array.isArray(v) ? v[0] : v;
    return typeof n === "number" && Number.isFinite(n) ? n : undefined;
  };

  const { ifd: ifd0, next: ifd1Offset } = readIfd(u32(4));
  const exif = readIfd(num(ifd0, 0x8769) ?? 0).ifd;
  const gps = readIfd(num(ifd0, 0x8825) ?? 0).ifd;
  const ifd1 = readIfd(ifd1Offset).ifd;

  const meta: PhotoMeta = {
    make: str(ifd0, 0x010f),
    model: str(ifd0, 0x0110),
    software: str(ifd0, 0x0131),
    artist: str(ifd0, 0x013b),
    copyright: str(ifd0, 0x8298),
    lens: str(exif, 0xa434),
    serial: str(exif, 0xa431),
    uniqueId: str(exif, 0xa420),
    takenAt: str(exif, 0x9003) ?? str(ifd0, 0x0132),
    offset: str(exif, 0x9011) ?? str(exif, 0x9010),
    width: num(exif, 0xa002),
    height: num(exif, 0xa003),
    fNumber: num(exif, 0x829d),
    iso: num(exif, 0x8827),
    focalLength: num(exif, 0x920a),
    tagCount,
  };

  const exposure = num(exif, 0x829a);
  if (exposure) meta.exposure = exposure >= 1 ? `${exposure}s` : `1/${Math.round(1 / exposure)}s`;

  const lat = toDegrees(gps.get(0x0002), str(gps, 0x0001));
  const lon = toDegrees(gps.get(0x0004), str(gps, 0x0003));
  // 0,0 is "Null Island": cameras write it when they had no fix.
  if (lat !== undefined && lon !== undefined && (lat !== 0 || lon !== 0)) {
    meta.latitude = lat;
    meta.longitude = lon;
    const alt = num(gps, 0x0006);
    if (alt !== undefined) {
      const ref = gps.get(0x0005);
      const below = ref instanceof Uint8Array ? ref[0] === 1 : ref === 1;
      meta.altitude = below ? -alt : alt;
    }
    meta.direction = num(gps, 0x0011);
    meta.gpsAccuracy = num(gps, 0x001f);
  }

  const thumbAt = num(ifd1, 0x0201);
  const thumbLength = num(ifd1, 0x0202);
  if (thumbAt && thumbLength && thumbAt + thumbLength <= tiff.byteLength) {
    meta.thumbnail = new Blob([new Uint8Array(tiff.buffer, tiff.byteOffset + thumbAt, thumbLength)], {
      type: "image/jpeg",
    });
  }

  return meta;
}

function toDegrees(value: Raw | undefined, ref: string | undefined) {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const deg = value[0] + value[1] / 60 + value[2] / 3600;
  return ref === "S" || ref === "W" ? -deg : deg;
}

/** "2024:05:17 14:03:22" → Date (local time of the camera). */
export function parseExifDate(value?: string) {
  const m = value?.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  const date = new Date(y, mo - 1, d, h, mi, s);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Re-encode through a canvas, which drops every metadata block. */
export async function stripMetadata(file: Blob): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
}
