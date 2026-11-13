import { track } from "../lib/analytics";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * An in-memory, anonymous event stream of this visit. It demonstrates what a
 * well-designed first-party tracker records: behaviour tied to a random ID,
 * no name, no email, no fingerprint. Nothing is persisted or sent anywhere;
 * reloading the page starts a new anonymous visitor.
 */

export interface SessionEvent {
  t: number; // ms since page load
  name: string;
  params?: Record<string, string | number>;
}

export type Tool = "retargeting" | "attribution" | "funnel" | "ab_test" | "clv" | "hashing";

export interface Session {
  anonId: string;
  startedAt: number;
  events: SessionEvent[];
  sectionsViewed: string[];
  toolsUsed: string[];
  maxScroll: number;
  device: "mobile" | "tablet" | "desktop";
  source: string;
  push: (name: string, params?: Record<string, string | number>) => void;
  markTool: (tool: Tool) => void;
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "anon_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function trafficSource() {
  const params = new URLSearchParams(location.search);
  const utm = params.get("utm_source");
  if (utm) return `${utm} / ${params.get("utm_medium") ?? "(not set)"}`;
  if (!document.referrer) return "direct";
  try {
    const host = new URL(document.referrer).hostname;
    if (host === location.hostname) return "internal";
    if (/google|bing|duckduckgo|yahoo/.test(host)) return `${host} / organic`;
    if (/facebook|instagram|t\.co|twitter|x\.com|linkedin|tiktok|whatsapp/.test(host)) return `${host} / social`;
    return `${host} / referral`;
  } catch {
    return "direct";
  }
}

function deviceType(): Session["device"] {
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

export function useSessionState(): Session {
  const [anonId] = useState(randomId);
  const [startedAt] = useState(() => performance.now());
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [sectionsViewed, setSections] = useState<string[]>([]);
  const [toolsUsed, setTools] = useState<string[]>([]);
  const [maxScroll, setMaxScroll] = useState(0);
  const [device] = useState(deviceType);
  const [source] = useState(trafficSource);
  const scrollMarks = useRef(new Set<number>());

  const push = useCallback(
    (name: string, params?: Record<string, string | number>) =>
      setEvents((prev) => [...prev.slice(-199), { t: Math.round(performance.now() - startedAt), name, params }]),
    [startedAt],
  );

  const toolsRef = useRef(new Set<string>());
  const markTool = useCallback(
    (tool: Tool) => {
      if (toolsRef.current.has(tool)) return;
      toolsRef.current.add(tool);
      push("tool_use", { tool });
      track("datatracking_tool", { tool });
      setTools((prev) => [...prev, tool]);
    },
    [push],
  );

  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    push("page_view", { page: location.pathname, source, device });
  }, [push, source, device]);

  // Scroll depth milestones, like GA4's scroll event but at several marks.
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100));
      setMaxScroll((m) => Math.max(m, pct));
      for (const mark of [25, 50, 75, 90]) {
        if (pct >= mark && !scrollMarks.current.has(mark)) {
          scrollMarks.current.add(mark);
          push("scroll", { percent: mark });
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [push]);

  // Section views: a section counts once half of it has been on screen.
  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            setSections((prev) => [...prev, id]);
            push("section_view", { section: id });
          }
        }
      },
      { threshold: 0.35 },
    );
    const attach = () => document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));
    attach();
    const t = setTimeout(attach, 500);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [push]);

  return useMemo(
    () => ({ anonId, startedAt, events, sectionsViewed, toolsUsed, maxScroll, device, source, push, markTool }),
    [anonId, startedAt, events, sectionsViewed, toolsUsed, maxScroll, device, source, push, markTool],
  );
}

export const SessionContext = createContext<Session | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionContext");
  return ctx;
}

/** Elapsed seconds since load, ticking once a second. */
export function useElapsed(startedAt: number) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return Math.floor((now - startedAt) / 1000);
}
