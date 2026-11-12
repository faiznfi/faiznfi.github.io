import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Records the same signals that analytics and session-replay tools record:
 * time, attention, scroll, pointer movement, clicks, keys and copies.
 * Values are kept in memory only and vanish when the tab closes.
 */

export interface BehaviorSnapshot {
  secondsOnPage: number;
  visibleSeconds: number;
  hiddenSeconds: number;
  idleSeconds: number;
  tabSwitches: number;
  windowBlurs: number;
  maxScrollPercent: number;
  pointerDistancePx: number;
  pointerMoves: number;
  clicks: number;
  rageClicks: number;
  keystrokes: number;
  resizes: number;
  copies: number;
  lastCopied?: string;
  lastClickTarget?: string;
}

interface TrailPoint {
  x: number;
  y: number;
  t: number;
  click?: boolean;
}

const TRAIL_MS = 8000;

function describe(element: EventTarget | null) {
  if (!(element instanceof Element)) return undefined;
  const text = element.textContent?.trim().replace(/\s+/g, " ").slice(0, 40);
  const tag = element.tagName.toLowerCase();
  return text ? `<${tag}> "${text}"` : `<${tag}>`;
}

export function useBehavior(trailCanvas: RefObject<HTMLCanvasElement | null>) {
  const stats = useRef<BehaviorSnapshot>({
    secondsOnPage: 0,
    visibleSeconds: 0,
    hiddenSeconds: 0,
    idleSeconds: 0,
    tabSwitches: 0,
    windowBlurs: 0,
    maxScrollPercent: 0,
    pointerDistancePx: 0,
    pointerMoves: 0,
    clicks: 0,
    rageClicks: 0,
    keystrokes: 0,
    resizes: 0,
    copies: 0,
  });
  const trail = useRef<TrailPoint[]>([]);
  const [snapshot, setSnapshot] = useState<BehaviorSnapshot>(stats.current);

  useEffect(() => {
    const s = stats.current;
    const start = performance.now();
    let lastInteraction = performance.now();
    let lastPointer: { x: number; y: number } | undefined;
    const recentClicks: { x: number; y: number; t: number }[] = [];

    const touch = () => {
      lastInteraction = performance.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      touch();
      s.pointerMoves++;
      if (lastPointer) s.pointerDistancePx += Math.hypot(e.clientX - lastPointer.x, e.clientY - lastPointer.y);
      lastPointer = { x: e.clientX, y: e.clientY };
      trail.current.push({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, t: performance.now() });
    };

    const onClick = (e: MouseEvent) => {
      touch();
      s.clicks++;
      s.lastClickTarget = describe(e.target);
      const now = performance.now();
      trail.current.push({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, t: now, click: true });
      recentClicks.push({ x: e.clientX, y: e.clientY, t: now });
      while (recentClicks.length && now - recentClicks[0].t > 700) recentClicks.shift();
      const nearby = recentClicks.filter((c) => Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40);
      if (nearby.length === 3) s.rageClicks++;
    };

    const onScroll = () => {
      touch();
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
      s.maxScrollPercent = Math.max(s.maxScrollPercent, percent);
    };

    const onKeyDown = () => {
      touch();
      s.keystrokes++;
    };

    const onCopy = () => {
      s.copies++;
      s.lastCopied = document.getSelection()?.toString().slice(0, 120);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") s.tabSwitches++;
    };
    const onBlur = () => s.windowBlurs++;
    const onResize = () => s.resizes++;

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("copy", onCopy);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);
    onScroll();

    let lastTick = performance.now();
    const tick = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTick) / 1000;
      lastTick = now;
      if (document.visibilityState === "visible") s.visibleSeconds += delta;
      else s.hiddenSeconds += delta;
      s.secondsOnPage = (now - start) / 1000;
      s.idleSeconds = (now - lastInteraction) / 1000;
      setSnapshot({ ...s });
    }, 500);

    // Cursor trail: what a session-replay tool would reconstruct.
    let frame = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const canvas = trailCanvas.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      const { width, height } = canvas;
      const now = performance.now();
      trail.current = trail.current.filter((p) => now - p.t < TRAIL_MS);
      ctx.clearRect(0, 0, width, height);

      const points = trail.current.filter((p) => !p.click);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let i = 1; i < points.length; i++) {
        const alpha = 1 - (now - points[i].t) / TRAIL_MS;
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x * width, points[i - 1].y * height);
        ctx.lineTo(points[i].x * width, points[i].y * height);
        ctx.stroke();
      }
      for (const p of trail.current.filter((p) => p.click)) {
        const alpha = 1 - (now - p.t) / TRAIL_MS;
        ctx.strokeStyle = `rgba(244, 114, 182, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 6 + (1 - alpha) * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
    draw();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      clearInterval(tick);
      cancelAnimationFrame(frame);
    };
  }, [trailCanvas]);

  return snapshot;
}
