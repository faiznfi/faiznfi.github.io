import { useEffect, useRef, useState, type RefObject } from "react";
import type { PreciseLocation } from "./collectors";
import type { CameraStatus } from "./useCamera";
import { Button, Card, Insight } from "./ui";

type LocationStatus = "idle" | "loading" | "done" | "error";

interface RevealProps {
  camera: { streamRef: RefObject<MediaStream | null>; status: CameraStatus; error?: string; start: () => void; stop: () => void };
  location: { value?: PreciseLocation; status: LocationStatus; error?: string; retry: () => void };
}

function headline(camera: CameraStatus, located: boolean, locationAnswered: boolean) {
  const cameraOn = camera === "on";
  if (camera === "idle" || camera === "asking" || !locationAnswered) {
    return ["Look at the top of your browser.", "This page just asked for your location and camera."];
  }
  if (camera === "unavailable") {
    return located
      ? ["You clicked Allow.", "No camera was found, but your location was enough. Here's what it handed over."]
      : ["You blocked your location.", "No camera was found on this device. Here's what you would have handed over."];
  }
  if (cameraOn && located) return ["You clicked Allow. Twice.", "No reason was given. Here's what that handed over."];
  if (cameraOn) return ["You blocked your location, but you let me see you.", "Here's what the camera handed over."];
  if (located) return ["You hid your face, but not where you are.", "Here's what your location handed over."];
  return ["You blocked both. Most people don't.", "Here's what would have appeared if you had clicked Allow."];
}

/**
 * Shows the result of the permission prompts fired on page load: the
 * visitor's live camera, an automatic still photo, and their GPS position.
 */
export function Reveal({ camera, location }: RevealProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [snapshot, setSnapshot] = useState<{ image: string; takenAt: Date }>();
  const [showMap, setShowMap] = useState(false);
  const precise = location.value;
  const preciseRef = useRef(precise);
  preciseRef.current = precise;

  const cameraOn = camera.status === "on";
  const locationAnswered = location.status === "done" || location.status === "error";
  const [title, subtitle] = headline(camera.status, location.status === "done", locationAnswered);

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
      takenAt.toLocaleString("en-GB"),
      loc ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)} (±${loc.accuracyM} m)` : "location: blocked",
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
      <span className="font-mono text-pink-400 text-[11px] uppercase tracking-widest">[!!] Did you just click "Allow"?</span>
      <h2 id="reveal-title" className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-white/60 text-lg">{subtitle}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Camera */}
        <Card title="Your camera">
          <div className="relative aspect-video bg-black border border-white/10 overflow-hidden">
            {cameraOn ? (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover -scale-x-100" />
                <span className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2 py-1 font-mono text-[11px] text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse" /> LIVE
                </span>
                {precise && (
                  <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 font-mono text-[11px] text-cyan-300">
                    {precise.latitude.toFixed(5)}, {precise.longitude.toFixed(5)}
                  </span>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/50">
                {camera.status === "asking" && "Waiting for your answer…"}
                {camera.status === "denied" && "Blocked. A site that got a yes would see your face here, live."}
                {camera.status === "off" && "Camera stopped."}
                {camera.status === "unavailable" && camera.error}
                {camera.status === "idle" && "Not requested yet."}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {cameraOn ? (
              <>
                <Button onClick={takeSnapshot}>Take another photo</Button>
                <Button onClick={camera.stop}>Turn camera off</Button>
              </>
            ) : (
              camera.status !== "asking" && <Button onClick={camera.start}>Ask again</Button>
            )}
          </div>
          <p className="mt-3 text-xs text-white/40">The video stays on your device. It is not recorded or uploaded.</p>
        </Card>

        {/* Location */}
        <Card title="Your location">
          {precise ? (
            <>
              <div className="font-mono text-3xl md:text-4xl text-cyan-400 tabular-nums break-all">
                {precise.latitude.toFixed(5)}, {precise.longitude.toFixed(5)}
              </div>
              <p className="mt-2 text-sm text-white/60">
                Accurate to about <span className="text-white">{precise.accuracyM} m</span>
                {precise.accuracyM <= 100 ? ": that's your building, not just your city." : "."}
              </p>
              <div className="mt-4 aspect-video border border-white/10 bg-black">
                {showMap && mapUrl ? (
                  <iframe title="Your location on a map" src={mapUrl} className="h-full w-full" loading="lazy" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <Button onClick={() => setShowMap(true)}>Show it on a map</Button>
                    <span className="text-xs text-white/40">Loads OpenStreetMap, which receives these coordinates.</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/50 border border-white/10 bg-black">
              {location.status === "loading" && "Waiting for your answer…"}
              {location.status === "error" && (location.error ?? "Location unavailable.")}
              {location.status === "idle" && "Not requested yet."}
            </div>
          )}
          {location.status !== "loading" && !precise && (
            <div className="mt-4">
              <Button onClick={location.retry}>Ask again</Button>
            </div>
          )}
        </Card>
      </div>

      {snapshot && (
        <Card title="Photo taken automatically, 3 seconds after you said yes" className="mt-4">
          <div className="grid gap-4 md:grid-cols-[2fr_3fr] items-start">
            <img src={snapshot.image} alt="A still photo of you taken by this page" className="w-full border border-white/10" />
            <div className="text-sm text-white/70 leading-relaxed space-y-3">
              <p>
                No button, no sound, no flash. The page captured this frame by itself and stamped it with the time
                {precise ? " and your coordinates" : ""}.
              </p>
              <p>
                This copy only exists in this tab's memory. A malicious site could upload the same image in one line of
                code, and you'd see nothing except the camera light that's already on.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Insight>
        If you clicked Allow without thinking, that's exactly how it happens. Prompts appear the moment a page loads,
        look routine, and block what you came to see, so people click whatever makes them go away. A permission
        you grant usually stays granted for that site on later visits too. Before you click Allow, ask: does this
        site actually need it, right now?
      </Insight>
    </section>
  );
}
