import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "idle" | "asking" | "on" | "denied" | "unavailable" | "off";

/**
 * Front camera stream for the /whoami demo. The stream is only attached to a
 * <video> element on this page. It is never recorded or uploaded, and it stops
 * when the page is hidden or closed.
 */
export function useCamera() {
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string>();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus((s) => (s === "on" ? "off" : s));
  }, []);

  const start = useCallback(async (): Promise<CameraStatus> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setError("This browser can't access a camera from this page.");
      return "unavailable";
    }
    setStatus("asking");
    setError(undefined);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStatus("on");
      return "on";
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        return "denied";
      }
      setStatus("unavailable");
      setError(name === "NotFoundError" ? "No camera found on this device." : "The camera is unavailable or in use by another app.");
      return "unavailable";
    }
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", stop);
    return () => window.removeEventListener("pagehide", stop);
  }, [stop]);

  return { streamRef, status, error, start, stop };
}
