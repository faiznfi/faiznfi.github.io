import { useEffect, useRef, useState } from "react";
import type { ScreenStatus } from "./useScreenShare";
import { Button, Card, Insight } from "./ui";

interface ScreenShareDemoProps {
  screen: {
    streamRef: React.RefObject<MediaStream | null>;
    status: ScreenStatus;
    error?: string;
    label?: string;
    start: () => void;
    stop: () => void;
  };
}

/**
 * Honest screen-capture demo. The button says exactly what it does. Once the
 * visitor shares, the page shows their own screen back to them, to make the
 * scale of a screen-share grant concrete. Nothing is recorded or uploaded.
 */
export function ScreenShareDemo({ screen }: ScreenShareDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [snapshot, setSnapshot] = useState<string>();
  const on = screen.status === "on";

  useEffect(() => {
    const video = videoRef.current;
    if (!on || !video) return;
    video.srcObject = screen.streamRef.current;
    video.play().catch(() => undefined);
    const id = window.setTimeout(() => {
      if (!video.videoWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setSnapshot(canvas.toDataURL("image/jpeg", 0.8));
    }, 2500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  return (
    <section id="screen" aria-labelledby="screen-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[08]</span>
      <h2 id="screen-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        Your whole screen, in one click
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">
        A scam you'll see in the wild: a page tells you to "verify you're human" or "fix a display error", and the button
        is wired to a screen-share request. The button below is honest about what it does, so you can watch the real
        prompt and see what you'd hand over. Your browser always asks first and lets you pick what to share.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title="Share your screen (honest button)">
          <div className="relative aspect-video bg-black border border-white/10 overflow-hidden">
            {on ? (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
                <span className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2 py-1 font-mono text-[11px] text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse" /> SHARING
                </span>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/50">
                {screen.status === "asking" && "Pick a window or screen in the browser prompt…"}
                {screen.status === "denied" && "You cancelled. A scam page would just ask again, dressed up differently."}
                {screen.status === "off" && "Screen share stopped."}
                {screen.status === "unavailable" && screen.error}
                {screen.status === "idle" && "Not shared yet."}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {on ? (
              <Button onClick={screen.stop}>Stop sharing</Button>
            ) : (
              screen.status !== "asking" && <Button onClick={screen.start}>Share your screen</Button>
            )}
          </div>
          {screen.label && on && <p className="mt-2 font-mono text-[11px] text-white/40 break-all">source: {screen.label}</p>}
          <p className="mt-3 text-xs text-white/40">The stream stays on your device. It is not recorded or uploaded.</p>
        </Card>

        <Card title="What the page can see">
          {snapshot ? (
            <>
              <img src={snapshot} alt="A still frame of your shared screen" className="w-full border border-white/10" />
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                This frame was grabbed automatically. If you shared your whole screen, it may include other tabs,
                notifications, chat windows, or anything that popped up, each a separate leak.
              </p>
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/50 border border-white/10 bg-black">
              Once you share, a still frame of your screen appears here.
            </div>
          )}
        </Card>
      </div>

      <Insight>
        Screen sharing always shows a browser prompt, and sharing a single window is safer than a whole screen. The
        danger is the lie around the button: if a page gives you an odd reason to share your screen, run commands, or
        "prove you're human" in a way that feels off, stop. Legitimate sites almost never need your screen.
      </Insight>
    </section>
  );
}
