import { useEffect, useRef, useState, type RefObject } from "react";
import type { PreciseLocation } from "./collectors";
import type { CameraStatus } from "./useCamera";
import { Button, Card, Insight } from "./ui";
import { useCopy, useLang } from "./i18n";

type LocationStatus = "idle" | "loading" | "done" | "error";

interface RevealProps {
  camera: { streamRef: RefObject<MediaStream | null>; status: CameraStatus; error?: string; start: () => void; stop: () => void };
  location: { value?: PreciseLocation; status: LocationStatus; error?: string; retry: () => void };
}

const COPY = {
  en: {
    kicker: '[!!] Did you just click "Allow"?',
    h: {
      look: ["Look at the top of your browser.", "This page just asked for your location and camera."],
      noCamLocated: ["You clicked Allow.", "No camera was found, but your location was enough. Here's what it handed over."],
      noCamBlocked: ["You blocked your location.", "No camera was found on this device. Here's what you would have handed over."],
      allowTwice: ["You clicked Allow. Twice.", "No reason was given. Here's what that handed over."],
      camOnly: ["You blocked your location, but you let me see you.", "Here's what the camera handed over."],
      locOnly: ["You hid your face, but not where you are.", "Here's what your location handed over."],
      blockedBoth: ["You blocked both. Most people don't.", "Here's what would have appeared if you had clicked Allow."],
    },
    cameraTitle: "Your camera",
    live: "LIVE",
    camWaiting: "Waiting for your answer…",
    camDenied: "Blocked. A site that got a yes would see your face here, live.",
    camOff: "Camera stopped.",
    camIdle: "Not requested yet.",
    takeAnother: "Take another photo",
    turnOff: "Turn camera off",
    askAgain: "Ask again",
    videoNote: "The video stays on your device. It is not recorded or uploaded.",
    locationTitle: "Your location",
    accuracyPrefix: "Accurate to about",
    accuracyBuilding: ": that's your building, not just your city.",
    accuracyPeriod: ".",
    showMap: "Show it on a map",
    mapNote: "Loads OpenStreetMap, which receives these coordinates.",
    locWaiting: "Waiting for your answer…",
    locUnavailable: "Location unavailable.",
    locIdle: "Not requested yet.",
    locBlocked: "location: blocked",
    snapshotTitle: "Photo taken automatically, 3 seconds after you said yes",
    snapAlt: "A still photo of you taken by this page",
    snapP1a: "No button, no sound, no flash. The page captured this frame by itself and stamped it with the time",
    snapP1coords: " and your coordinates",
    snapP2:
      "This copy only exists in this tab's memory. A malicious site could upload the same image in one line of code, and you'd see nothing except the camera light that's already on.",
    insight:
      "If you clicked Allow without thinking, that's exactly how it happens. Prompts appear the moment a page loads, look routine, and block what you came to see, so people click whatever makes them go away. A permission you grant usually stays granted for that site on later visits too. Before you click Allow, ask: does this site actually need it, right now?",
  },
  id: {
    kicker: '[!!] Barusan kamu klik "Izinkan"?',
    h: {
      look: ["Lihat bagian atas browser kamu.", "Halaman ini barusan meminta lokasi dan kamera kamu."],
      noCamLocated: ["Kamu klik Izinkan.", "Tidak ada kamera ditemukan, tapi lokasimu sudah cukup. Ini yang diserahkan."],
      noCamBlocked: ["Kamu memblokir lokasimu.", "Tidak ada kamera di perangkat ini. Ini yang akan kamu serahkan."],
      allowTwice: ["Kamu klik Izinkan. Dua kali.", "Tanpa alasan apa pun. Ini yang diserahkan."],
      camOnly: ["Kamu memblokir lokasi, tapi membiarkan aku melihatmu.", "Ini yang diserahkan kamera."],
      locOnly: ["Kamu menyembunyikan wajah, tapi tidak lokasimu.", "Ini yang diserahkan lokasimu."],
      blockedBoth: ["Kamu memblokir keduanya. Kebanyakan orang tidak.", "Ini yang akan muncul kalau kamu klik Izinkan."],
    },
    cameraTitle: "Kamera kamu",
    live: "LANGSUNG",
    camWaiting: "Menunggu jawabanmu…",
    camDenied: "Diblokir. Situs yang mendapat 'ya' akan melihat wajahmu di sini, langsung.",
    camOff: "Kamera dihentikan.",
    camIdle: "Belum diminta.",
    takeAnother: "Ambil foto lagi",
    turnOff: "Matikan kamera",
    askAgain: "Minta lagi",
    videoNote: "Video tetap di perangkatmu. Tidak direkam atau diunggah.",
    locationTitle: "Lokasi kamu",
    accuracyPrefix: "Akurat sampai sekitar",
    accuracyBuilding: ": itu gedungmu, bukan hanya kotamu.",
    accuracyPeriod: ".",
    showMap: "Tampilkan di peta",
    mapNote: "Memuat OpenStreetMap, yang menerima koordinat ini.",
    locWaiting: "Menunggu jawabanmu…",
    locUnavailable: "Lokasi tidak tersedia.",
    locIdle: "Belum diminta.",
    locBlocked: "lokasi: diblokir",
    snapshotTitle: "Foto diambil otomatis, 3 detik setelah kamu bilang ya",
    snapAlt: "Foto diam dirimu yang diambil halaman ini",
    snapP1a: "Tanpa tombol, tanpa suara, tanpa flash. Halaman ini menangkap gambar ini sendiri dan menandainya dengan waktu",
    snapP1coords: " dan koordinatmu",
    snapP2:
      "Salinan ini hanya ada di memori tab ini. Situs jahat bisa mengunggah gambar yang sama dengan satu baris kode, dan kamu tidak akan melihat apa pun selain lampu kamera yang sudah menyala.",
    insight:
      "Kalau kamu klik Izinkan tanpa berpikir, persis begitulah caranya terjadi. Prompt muncul saat halaman dimuat, terlihat biasa, dan menghalangi apa yang ingin kamu lihat, jadi orang klik apa pun yang membuatnya hilang. Izin yang kamu berikan biasanya tetap aktif untuk situs itu pada kunjungan berikutnya. Sebelum klik Izinkan, tanya: apakah situs ini memang butuh itu, sekarang?",
  },
};

function headline(h: (typeof COPY)["en"]["h"], camera: CameraStatus, located: boolean, locationAnswered: boolean) {
  const cameraOn = camera === "on";
  if (camera === "idle" || camera === "asking" || !locationAnswered) return h.look;
  if (camera === "unavailable") return located ? h.noCamLocated : h.noCamBlocked;
  if (cameraOn && located) return h.allowTwice;
  if (cameraOn) return h.camOnly;
  if (located) return h.locOnly;
  return h.blockedBoth;
}

/**
 * Shows the result of the permission prompts fired on page load: the
 * visitor's live camera, an automatic still photo, and their GPS position.
 */
export function Reveal({ camera, location }: RevealProps) {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [snapshot, setSnapshot] = useState<{ image: string; takenAt: Date }>();
  const [showMap, setShowMap] = useState(false);
  const precise = location.value;
  const preciseRef = useRef(precise);
  preciseRef.current = precise;
  const tRef = useRef(t);
  tRef.current = t;

  const cameraOn = camera.status === "on";
  const locationAnswered = location.status === "done" || location.status === "error";
  const [title, subtitle] = headline(t.h, camera.status, location.status === "done", locationAnswered);

  function takeSnapshot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror, like the live preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const takenAt = new Date();
    const loc = preciseRef.current;
    const lines = [
      takenAt.toLocaleString(lang === "id" ? "id-ID" : "en-GB"),
      loc ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)} (±${loc.accuracyM} m)` : tRef.current.locBlocked,
    ];
    const size = Math.max(14, Math.round(canvas.width / 40));
    ctx.font = `${size}px ui-monospace, monospace`;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - size * 3.2, canvas.width, size * 3.2);
    ctx.fillStyle = "#22d3ee";
    lines.forEach((line, i) => ctx.fillText(line, size, canvas.height - size * (2 - i * 1.2)));
    setSnapshot({ image: canvas.toDataURL("image/jpeg", 0.85), takenAt });
  }

  // Attach the stream, then take an automatic photo after a few seconds.
  useEffect(() => {
    const video = videoRef.current;
    if (!cameraOn || !video) return;
    video.srcObject = camera.streamRef.current;
    video.play().catch(() => undefined);
    const id = window.setTimeout(takeSnapshot, 3000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn]);

  const delta = 0.004;
  const mapUrl =
    precise &&
    `https://www.openstreetmap.org/export/embed.html?bbox=${precise.longitude - delta},${precise.latitude - delta},${precise.longitude + delta},${precise.latitude + delta}&layer=mapnik&marker=${precise.latitude},${precise.longitude}`;

  return (
    <section aria-labelledby="reveal-title" className="pb-16">
      <span className="font-mono text-pink-400 text-[11px] uppercase tracking-widest">{t.kicker}</span>
      <h2 id="reveal-title" className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-white/60 text-lg">{subtitle}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Camera */}
        <Card title={t.cameraTitle}>
          <div className="relative aspect-video bg-black border border-white/10 overflow-hidden">
            {cameraOn ? (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover -scale-x-100" />
                <span className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2 py-1 font-mono text-[11px] text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse" /> {t.live}
                </span>
                {precise && (
                  <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 font-mono text-[11px] text-cyan-300">
                    {precise.latitude.toFixed(5)}, {precise.longitude.toFixed(5)}
                  </span>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/50">
                {camera.status === "asking" && t.camWaiting}
                {camera.status === "denied" && t.camDenied}
                {camera.status === "off" && t.camOff}
                {camera.status === "unavailable" && camera.error}
                {camera.status === "idle" && t.camIdle}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {cameraOn ? (
              <>
                <Button onClick={takeSnapshot}>{t.takeAnother}</Button>
                <Button onClick={camera.stop}>{t.turnOff}</Button>
              </>
            ) : (
              camera.status !== "asking" && <Button onClick={camera.start}>{t.askAgain}</Button>
            )}
          </div>
          <p className="mt-3 text-xs text-white/40">{t.videoNote}</p>
        </Card>

        {/* Location */}
        <Card title={t.locationTitle}>
          {precise ? (
            <>
              <div className="font-mono text-3xl md:text-4xl text-cyan-400 tabular-nums break-all">
                {precise.latitude.toFixed(5)}, {precise.longitude.toFixed(5)}
              </div>
              <p className="mt-2 text-sm text-white/60">
                {t.accuracyPrefix} <span className="text-white">{precise.accuracyM} m</span>
                {precise.accuracyM <= 100 ? t.accuracyBuilding : t.accuracyPeriod}
              </p>
              <div className="mt-4 aspect-video border border-white/10 bg-black">
                {showMap && mapUrl ? (
                  <iframe title="Your location on a map" src={mapUrl} className="h-full w-full" loading="lazy" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <Button onClick={() => setShowMap(true)}>{t.showMap}</Button>
                    <span className="text-xs text-white/40">{t.mapNote}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/50 border border-white/10 bg-black">
              {location.status === "loading" && t.locWaiting}
              {location.status === "error" && (location.error ?? t.locUnavailable)}
              {location.status === "idle" && t.locIdle}
            </div>
          )}
          {location.status !== "loading" && !precise && (
            <div className="mt-4">
              <Button onClick={location.retry}>{t.askAgain}</Button>
            </div>
          )}
        </Card>
      </div>

      {snapshot && (
        <Card title={t.snapshotTitle} className="mt-4">
          <div className="grid gap-4 md:grid-cols-[2fr_3fr] items-start">
            <img src={snapshot.image} alt={t.snapAlt} className="w-full border border-white/10" />
            <div className="text-sm text-white/70 leading-relaxed space-y-3">
              <p>
                {t.snapP1a}
                {precise ? t.snapP1coords : ""}.
              </p>
              <p>{t.snapP2}</p>
            </div>
          </div>
        </Card>
      )}

      <Insight>{t.insight}</Insight>
    </section>
  );
}
