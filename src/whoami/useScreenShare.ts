import { useCallback, useEffect, useRef, useState } from "react";

export type ScreenStatus = "idle" | "asking" | "on" | "denied" | "unavailable" | "off";

/**
 * Screen-share stream for the /whoami demo. Honest: the button that calls this
 * says "Share your screen", and the browser shows its own picker. The stream is
 * only displayed back to the visitor on this page; it is never recorded or
 * uploaded, and it stops when the page is hidden or the visitor stops sharing.
 */
export function useScreenShare() {
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<ScreenStatus>("idle");
  const [error, setError] = useState<string>();
  const [label, setLabel] = useState<string>();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus((s) => (s === "on" ? "off" : s));
  }, []);

  const start = useCallback(async (): Promise<ScreenStatus> => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setStatus("unavailable");
      setError("This browser can't share a screen from a page (common on phones).");
      return "unavailable";
    }
    setStatus("asking");
    setError(undefined);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      setLabel(track?.label);
      // The visitor can also stop sharing from the browser's own bar.
      track?.addEventListener("ended", stop);
      setStatus("on");
      return "on";
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setStatus("denied");
        return "denied";
      }
      setStatus("unavailable");
      setError("Screen share is unavailable on this device.");
      return "unavailable";
    }
  }, [stop]);

  useEffect(() => {
    window.addEventListener("pagehide", stop);
    return () => window.removeEventListener("pagehide", stop);
  }, [stop]);

  return { streamRef, status, error, label, start, stop };
}
