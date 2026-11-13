import { useEffect, useRef, useState, type DragEvent } from "react";
import { track } from "../lib/analytics";
import { Button, Card, Insight, Row, Rows } from "./ui";
import { useCopy, useLang } from "./i18n";
import { parseExifDate, readExif, stripMetadata, type PhotoMeta } from "./exif";

const SAMPLE_URL = "/whoami/sample-photo.jpg";

const COPY = {
  en: {
    title: "Your photos carry a hidden label",
    lead: "Every photo a phone takes is stamped with metadata called EXIF: where you stood, the exact second, which phone, sometimes your name and the phone's serial number. You don't see it in the gallery, but anyone who gets the original file does. Pick a photo to see what it's carrying.",
    pickTitle: "Pick a photo",
    drop: "Drop a photo here, or",
    browse: "choose a file",
    sample: "Use the sample photo",
    pickNote:
      "The photo is read on your device only and never uploaded. Works best with an original JPEG straight from a phone camera. iPhone HEIC photos are usually converted to JPEG when picked in a browser.",
    reading: "Reading the file…",
    notJpeg: "This demo reads JPEG photos. This file is a different format (PNG, HEIC, WebP…), so try a photo taken with the phone camera.",
    noExif:
      "No metadata found. This photo was already stripped, which is what happens to screenshots and to photos saved from WhatsApp, Instagram or Facebook. Try an original photo from your camera roll.",
    noGps:
      "No location in this one. Location tagging was off when it was taken, or the location was removed when sharing. The rest is still there.",
    revealTitle: "What this photo just told me",
    where: "Taken here",
    accuracy: "accuracy",
    facing: "facing",
    openMap: "Open on map ↗",
    mapNote: "Opening the map sends these coordinates to OpenStreetMap. Nothing else leaves this page.",
    when: "Taken on",
    who: "Owner name written in the file",
    device: "Taken with",
    serial: "Camera serial number",
    edited: "Edited with",
    detailsTitle: "All the details",
    labels: {
      file: "File name",
      size: "File size",
      modified: "File last modified",
      make: "Make",
      model: "Model",
      lens: "Lens",
      software: "Software",
      artist: "Artist / owner",
      copyright: "Copyright",
      serial: "Body serial number",
      uniqueId: "Unique image ID",
      takenAt: "Date taken",
      offset: "Time zone",
      size2: "Dimensions",
      settings: "Camera settings",
      lat: "Latitude",
      lon: "Longitude",
      alt: "Altitude",
      dir: "Direction faced",
      tags: "Metadata tags found",
    },
    thumbTitle: "The hidden thumbnail",
    thumbBody:
      "JPEGs also carry a small preview image. Some editing apps crop or blur the photo but forget to update this preview, so the original, uncropped picture is still inside the file.",
    thumbSample: "In the sample, the visible photo is just a coffee cup. The thumbnail still shows the sticky note with a Wi-Fi password and an office PIN that was cropped out.",
    visible: "What you see",
    hidden: "What's still in the file",
    cleanTitle: "Get a clean copy",
    cleanBody: "Re-drawing the photo strips every metadata field, location and thumbnail included. This also happens on your device.",
    cleanBtn: "Download without metadata",
    insight:
      "Instagram, Facebook, X and WhatsApp's normal photo send remove most metadata from what other people get, though the platform itself still received the original. But files sent as a document on WhatsApp or Telegram, email attachments, cloud-drive links, online marketplaces, forums and blogs often keep everything. Stalkers have found homes from a single photo this way. Turn off location tagging in your camera app, and on iPhone tap Options → Location off in the share sheet before sending.",
    compass: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"],
  },
  id: {
    title: "Foto kamu membawa label tersembunyi",
    lead: "Setiap foto dari ponsel diberi metadata bernama EXIF: di mana kamu berdiri, detik persisnya, ponsel apa, kadang nama kamu dan nomor seri ponsel. Kamu tidak melihatnya di galeri, tapi siapa pun yang mendapat file aslinya bisa. Pilih foto untuk melihat apa yang dibawanya.",
    pickTitle: "Pilih foto",
    drop: "Tarik foto ke sini, atau",
    browse: "pilih file",
    sample: "Pakai foto contoh",
    pickNote:
      "Foto dibaca di perangkatmu saja dan tidak pernah diunggah. Paling cocok dengan JPEG asli langsung dari kamera ponsel. Foto HEIC iPhone biasanya otomatis diubah ke JPEG saat dipilih di browser.",
    reading: "Membaca file…",
    notJpeg: "Demo ini membaca foto JPEG. File ini formatnya lain (PNG, HEIC, WebP…), jadi coba foto yang diambil dengan kamera ponsel.",
    noExif:
      "Tidak ada metadata. Foto ini sudah dibersihkan, seperti yang terjadi pada screenshot dan foto yang disimpan dari WhatsApp, Instagram, atau Facebook. Coba foto asli dari galeri kamera.",
    noGps:
      "Tidak ada lokasi di foto ini. Penanda lokasi sedang mati saat foto diambil, atau lokasinya dihapus saat dibagikan. Sisanya tetap ada.",
    revealTitle: "Yang baru saja diceritakan foto ini",
    where: "Diambil di sini",
    accuracy: "akurasi",
    facing: "menghadap",
    openMap: "Buka di peta ↗",
    mapNote: "Membuka peta mengirim koordinat ini ke OpenStreetMap. Tidak ada data lain yang keluar dari halaman ini.",
    when: "Diambil pada",
    who: "Nama pemilik yang tertulis di file",
    device: "Diambil dengan",
    serial: "Nomor seri kamera",
    edited: "Diedit dengan",
    detailsTitle: "Semua detail",
    labels: {
      file: "Nama file",
      size: "Ukuran file",
      modified: "File terakhir diubah",
      make: "Merek",
      model: "Model",
      lens: "Lensa",
      software: "Software",
      artist: "Artis / pemilik",
      copyright: "Hak cipta",
      serial: "Nomor seri bodi",
      uniqueId: "ID unik gambar",
      takenAt: "Tanggal diambil",
      offset: "Zona waktu",
      size2: "Dimensi",
      settings: "Pengaturan kamera",
      lat: "Lintang",
      lon: "Bujur",
      alt: "Ketinggian",
      dir: "Arah menghadap",
      tags: "Jumlah tag metadata",
    },
    thumbTitle: "Thumbnail tersembunyi",
    thumbBody:
      "JPEG juga membawa gambar pratinjau kecil. Sebagian aplikasi edit memotong atau mengaburkan foto tapi lupa memperbarui pratinjau ini, jadi gambar asli yang belum dipotong masih ada di dalam file.",
    thumbSample: "Di foto contoh, yang terlihat hanya cangkir kopi. Thumbnail-nya masih menunjukkan catatan tempel berisi password Wi-Fi dan PIN kantor yang sudah dipotong.",
    visible: "Yang kamu lihat",
    hidden: "Yang masih ada di file",
    cleanTitle: "Ambil salinan bersih",
    cleanBody: "Menggambar ulang foto menghapus semua metadata, termasuk lokasi dan thumbnail. Ini juga terjadi di perangkatmu saja.",
    cleanBtn: "Unduh tanpa metadata",
    insight:
      "Instagram, Facebook, X, dan kirim foto biasa di WhatsApp menghapus sebagian besar metadata dari yang diterima orang lain, meski platformnya sendiri tetap menerima file asli. Tapi file yang dikirim sebagai dokumen di WhatsApp atau Telegram, lampiran email, tautan Google Drive, marketplace, forum, dan blog sering menyimpan semuanya. Penguntit pernah menemukan rumah seseorang hanya dari satu foto dengan cara ini. Matikan penanda lokasi di aplikasi kamera, dan di iPhone ketuk Opsi → Lokasi mati di menu bagikan sebelum mengirim.",
    compass: ["utara", "timur laut", "timur", "tenggara", "selatan", "barat daya", "barat", "barat laut"],
  },
};

type Status = "idle" | "reading" | "done" | "notJpeg" | "noExif";

interface Loaded {
  name: string;
  size: number;
  modified?: Date;
  blob: Blob;
  meta?: PhotoMeta;
  sample: boolean;
}

const fmtBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** Object URL for a blob, revoked when the blob changes or the component unmounts. */
function useObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return setUrl(undefined);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

/**
 * Photo metadata (EXIF): reads location, time, device, owner and the embedded
 * thumbnail from a photo the visitor picks. Parsing happens locally; the file
 * is never uploaded.
 */
export function PhotoMetadata() {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [loaded, setLoaded] = useState<Loaded>();
  const [dragging, setDragging] = useState(false);
  const photoUrl = useObjectUrl(loaded?.blob);
  const thumbUrl = useObjectUrl(loaded?.meta?.thumbnail);

  async function load(blob: Blob, name: string, modified: Date | undefined, sample: boolean) {
    setStatus("reading");
    const meta = readExif(await blob.arrayBuffer());
    const isJpeg = blob.type === "image/jpeg" || /\.jpe?g$/i.test(name);
    setLoaded({ name, size: blob.size, modified, blob, meta, sample });
    setStatus(meta ? "done" : isJpeg ? "noExif" : "notJpeg");
    if (!sample) track("whoami_action", { demo_action: "photo_metadata", demo_result: meta ? "success" : "error" });
  }

  function onFile(file?: File) {
    if (file) void load(file, file.name, new Date(file.lastModified), false);
  }

  async function loadSample() {
    setStatus("reading");
    const blob = await (await fetch(SAMPLE_URL)).blob();
    track("whoami_action", { demo_action: "photo_metadata", demo_result: "started" });
    void load(blob, "IMG_20240817_074219.jpg", undefined, true);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    onFile(e.dataTransfer.files[0]);
  }

  async function downloadClean() {
    if (!loaded) return;
    const clean = await stripMetadata(loaded.blob);
    if (!clean) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(clean);
    a.download = loaded.name.replace(/\.[^.]+$/, "") + "-clean.jpg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const meta = loaded?.meta;
  const takenDate = parseExifDate(meta?.takenAt);
  const fmtTaken = takenDate?.toLocaleString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hasGps = meta?.latitude !== undefined && meta.longitude !== undefined;
  const coords = hasGps ? `${meta.latitude!.toFixed(5)}, ${meta.longitude!.toFixed(5)}` : undefined;
  const compass = meta?.direction !== undefined ? t.compass[Math.round(meta.direction / 45) % 8] : undefined;
  const device = [meta?.make, meta?.model].filter(Boolean).join(" ");

  return (
    <section id="photo" aria-labelledby="photo-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[14]</span>
      <h2 id="photo-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {t.title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">{t.lead}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title={t.pickTitle}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border border-dashed p-6 text-center text-sm transition-colors ${
              dragging ? "border-cyan-400 bg-cyan-500/5" : "border-white/15"
            }`}
          >
            <span className="text-white/60">{t.drop} </span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
            >
              {t.browse}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <div className="mt-4">
            <Button onClick={loadSample}>{t.sample}</Button>
          </div>
          <p className="mt-3 text-xs text-white/40">{t.pickNote}</p>
        </Card>

        <Card title={t.revealTitle}>
          {status === "idle" && <p className="text-sm text-white/40">—</p>}
          {status === "reading" && <p className="text-sm text-white/50">{t.reading}</p>}
          {status === "notJpeg" && <p className="text-sm text-white/60">{t.notJpeg}</p>}
          {status === "noExif" && <p className="text-sm text-white/60">{t.noExif}</p>}
          {status === "done" && meta && (
            <div className="space-y-4">
              {hasGps ? (
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-white/40">{t.where}</div>
                  <div className="mt-1 font-mono text-2xl text-pink-400 tabular-nums">{coords}</div>
                  <div className="mt-1 text-xs text-white/50">
                    {[
                      meta.gpsAccuracy !== undefined && `${t.accuracy} ±${Math.round(meta.gpsAccuracy)} m`,
                      compass && `${t.facing} ${compass}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${meta.latitude}&mlon=${meta.longitude}#map=18/${meta.latitude}/${meta.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    {t.openMap}
                  </a>
                  <p className="mt-1 text-[11px] text-white/35">{t.mapNote}</p>
                </div>
              ) : (
                <p className="text-sm text-amber-300/80">{t.noGps}</p>
              )}
              <Finding label={t.when} value={fmtTaken && `${fmtTaken}${meta.offset ? ` (UTC${meta.offset})` : ""}`} />
              <Finding label={t.device} value={device || undefined} />
              <Finding label={t.who} value={meta.artist} highlight />
              <Finding label={t.serial} value={meta.serial} highlight />
              <Finding label={t.edited} value={meta.software} />
            </div>
          )}
        </Card>
      </div>

      {status === "done" && meta && loaded && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {thumbUrl && photoUrl ? (
            <Card title={t.thumbTitle}>
              <p className="text-sm text-white/70 leading-relaxed">{t.thumbBody}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <figure>
                  <img src={photoUrl} alt="" className="w-full aspect-[4/3] object-cover border border-white/10" />
                  <figcaption className="mt-1 font-mono text-[11px] text-white/40">{t.visible}</figcaption>
                </figure>
                <figure>
                  <img src={thumbUrl} alt="" className="w-full aspect-[4/3] object-contain bg-black border border-pink-500/40" />
                  <figcaption className="mt-1 font-mono text-[11px] text-pink-400">{t.hidden}</figcaption>
                </figure>
              </div>
              {loaded.sample && <p className="mt-3 text-xs text-white/50">{t.thumbSample}</p>}
            </Card>
          ) : (
            photoUrl && (
              <Card>
                <img src={photoUrl} alt="" className="w-full max-h-80 object-contain" />
              </Card>
            )
          )}

          <Card title={t.detailsTitle}>
            <Rows>
              <Row label={t.labels.file} value={loaded.name} />
              <Row label={t.labels.size} value={fmtBytes(loaded.size)} />
              <Row label={t.labels.modified} value={loaded.modified?.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })} />
              <Row label={t.labels.make} value={meta.make} />
              <Row label={t.labels.model} value={meta.model} />
              <Row label={t.labels.lens} value={meta.lens} />
              <Row label={t.labels.software} value={meta.software} />
              <Row label={t.labels.artist} value={meta.artist} />
              <Row label={t.labels.copyright} value={meta.copyright} />
              <Row label={t.labels.serial} value={meta.serial} />
              <Row label={t.labels.uniqueId} value={meta.uniqueId} />
              <Row label={t.labels.takenAt} value={meta.takenAt} />
              <Row label={t.labels.offset} value={meta.offset && `UTC${meta.offset}`} />
              <Row label={t.labels.size2} value={meta.width && meta.height ? `${meta.width} × ${meta.height}` : undefined} />
              <Row
                label={t.labels.settings}
                value={
                  [
                    meta.fNumber && `f/${meta.fNumber}`,
                    meta.exposure,
                    meta.iso && `ISO ${meta.iso}`,
                    meta.focalLength && `${meta.focalLength} mm`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || undefined
                }
              />
              <Row label={t.labels.lat} value={meta.latitude?.toFixed(6)} />
              <Row label={t.labels.lon} value={meta.longitude?.toFixed(6)} />
              <Row label={t.labels.alt} value={meta.altitude !== undefined ? `${meta.altitude.toFixed(1)} m` : undefined} />
              <Row label={t.labels.dir} value={meta.direction !== undefined ? `${Math.round(meta.direction)}° (${compass})` : undefined} />
              <Row label={t.labels.tags} value={meta.tagCount} />
            </Rows>
          </Card>

          <Card title={t.cleanTitle} className="lg:col-span-2">
            <p className="text-sm text-white/70 leading-relaxed">{t.cleanBody}</p>
            <div className="mt-4">
              <Button onClick={downloadClean}>{t.cleanBtn}</Button>
            </div>
          </Card>
        </div>
      )}

      <Insight>{t.insight}</Insight>
    </section>
  );
}

function Finding({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-white/40">{label}</div>
      <div className={`mt-0.5 text-sm ${highlight ? "text-pink-400 font-mono" : "text-[#E0E0E6]"}`}>{value}</div>
    </div>
  );
}
