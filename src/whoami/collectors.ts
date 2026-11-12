/**
 * Everything here runs in the visitor's browser. Nothing is persisted or sent
 * anywhere, except `lookupIp()`, which only runs when the visitor clicks a
 * button and sends their IP to a third-party geo-IP service.
 */

type HighEntropyValues = {
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  fullVersionList?: { brand: string; version: string }[];
};

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean; type?: string };
  userAgentData?: {
    brands: { brand: string; version: string }[];
    mobile: boolean;
    platform: string;
    getHighEntropyValues(hints: string[]): Promise<HighEntropyValues>;
  };
  getBattery?: () => Promise<{ level: number; charging: boolean; chargingTime: number; dischargingTime: number }>;
  globalPrivacyControl?: boolean;
};

export const nav = navigator as NavigatorExtras;

// ---------------------------------------------------------------------------
// User agent
// ---------------------------------------------------------------------------

function match(re: RegExp, ua: string) {
  return re.exec(ua)?.[1];
}

export function parseUserAgent(ua: string) {
  let os = "Unknown OS";
  const android = match(/Android ([\d.]+)/, ua);
  const ios = match(/(?:iPhone|iPad|iPod).*? OS ([\d_]+)/, ua);
  if (ios) os = `iOS ${ios.replace(/_/g, ".")}`;
  else if (android) os = `Android ${android}`;
  else if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "Unknown browser";
  const rules: [RegExp, string][] = [
    [/Edg(?:A|iOS)?\/(\d+)/, "Edge"],
    [/OPR\/(\d+)/, "Opera"],
    [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
    [/(?:Firefox|FxiOS)\/(\d+)/, "Firefox"],
    [/CriOS\/(\d+)/, "Chrome"],
    [/Chrome\/(\d+)/, "Chrome"],
    [/Version\/(\d+).*Safari/, "Safari"],
  ];
  for (const [re, name] of rules) {
    const version = match(re, ua);
    if (version) {
      browser = `${name} ${version}`;
      break;
    }
  }

  const mobile = /Mobi|Android|iPhone|iPad/.test(ua);
  const inApp = match(/(FBAN|FBAV|Instagram|Line\/|LinkedInApp|Twitter|TikTok|musical_ly)/, ua);
  return { os, browser, mobile, inApp: inApp?.replace("/", "") };
}

// ---------------------------------------------------------------------------
// Synchronous facts
// ---------------------------------------------------------------------------

function gpuInfo() {
  try {
    const gl = document.createElement("canvas").getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return {};
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      vendor: String(ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)),
      renderer: String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)),
    };
  } catch {
    return {};
  }
}

const media = (query: string) => window.matchMedia(query).matches;

export function collectStatic() {
  const ua = navigator.userAgent;
  const parsed = parseUserAgent(ua);
  const gpu = gpuInfo();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const conn = nav.connection;

  return {
    ua,
    ...parsed,
    timeZone,
    utcOffset: -new Date().getTimezoneOffset() / 60,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    languages: [...(navigator.languages ?? [navigator.language])],
    cores: navigator.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    gpuVendor: gpu.vendor,
    gpuRenderer: gpu.renderer,
    screen: `${screen.width} × ${screen.height}`,
    availScreen: `${screen.availWidth} × ${screen.availHeight}`,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    orientation: screen.orientation?.type,
    touchPoints: navigator.maxTouchPoints,
    connectionType: conn?.type,
    effectiveType: conn?.effectiveType,
    downlinkMbps: conn?.downlink,
    rttMs: conn?.rtt,
    saveData: conn?.saveData,
    darkMode: media("(prefers-color-scheme: dark)"),
    reducedMotion: media("(prefers-reduced-motion: reduce)"),
    highContrast: media("(prefers-contrast: more)"),
    forcedColors: media("(forced-colors: active)"),
    hoverCapable: media("(hover: hover)"),
    doNotTrack: navigator.doNotTrack === "1",
    globalPrivacyControl: nav.globalPrivacyControl,
    cookiesEnabled: navigator.cookieEnabled,
    pdfViewer: navigator.pdfViewerEnabled,
    webdriver: navigator.webdriver,
    online: navigator.onLine,
  };
}

export type StaticInfo = ReturnType<typeof collectStatic>;

// ---------------------------------------------------------------------------
// Asynchronous facts (no permission prompts)
// ---------------------------------------------------------------------------

const PERMISSIONS = ["geolocation", "notifications", "camera", "microphone", "clipboard-read", "persistent-storage"];

export async function collectAsync() {
  const [highEntropy, battery, storage, devices, permissions] = await Promise.all([
    nav.userAgentData
      ?.getHighEntropyValues(["architecture", "bitness", "model", "platformVersion", "fullVersionList"])
      .catch(() => undefined),
    nav.getBattery?.().catch(() => undefined),
    navigator.storage?.estimate().catch(() => undefined),
    navigator.mediaDevices?.enumerateDevices().catch(() => undefined),
    Promise.all(
      PERMISSIONS.map(async (name) => {
        try {
          const status = await navigator.permissions.query({ name } as PermissionDescriptor);
          return [name, status.state] as const;
        } catch {
          return [name, "unsupported"] as const;
        }
      }),
    ),
  ]);

  const count = (kind: MediaDeviceKind) => devices?.filter((d) => d.kind === kind).length;

  return {
    highEntropy,
    battery: battery && { level: Math.round(battery.level * 100), charging: battery.charging },
    storageQuotaGb: storage?.quota !== undefined ? storage.quota / 1024 ** 3 : undefined,
    cameras: count("videoinput"),
    microphones: count("audioinput"),
    speakers: count("audiooutput"),
    permissions: Object.fromEntries(permissions) as Record<string, string>,
  };
}

export type AsyncInfo = Awaited<ReturnType<typeof collectAsync>>;

// ---------------------------------------------------------------------------
// How the visitor arrived
// ---------------------------------------------------------------------------

export function collectArrival() {
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries([...params].filter(([key]) => key.startsWith("utm_") || key.endsWith("clid")));
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

  let referrerHost: string | undefined;
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname : undefined;
  } catch {
    referrerHost = undefined;
  }

  return {
    referrer: document.referrer || undefined,
    referrerHost,
    utm,
    historyLength: history.length,
    navigationType: nav?.type,
    timing: nav && {
      dnsMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      connectMs: Math.round(nav.connectEnd - nav.connectStart),
      ttfbMs: Math.round(nav.responseStart - nav.requestStart),
      loadMs: Math.round(nav.loadEventEnd > 0 ? nav.loadEventEnd : performance.now()),
      protocol: nav.nextHopProtocol,
    },
  };
}

export type ArrivalInfo = ReturnType<typeof collectArrival>;

// ---------------------------------------------------------------------------
// Cookies & storage set on this origin (e.g. Google Analytics)
// ---------------------------------------------------------------------------

export function readCookies() {
  const cookies = Object.fromEntries(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf("=");
        return [pair.slice(0, index), decodeURIComponent(pair.slice(index + 1))];
      }),
  );

  // _ga = GA1.1.<random>.<first-visit unix timestamp>
  const ga = cookies._ga?.split(".");
  const clientId = ga && ga.length >= 4 ? `${ga[2]}.${ga[3]}` : undefined;
  const firstVisit = ga && ga.length >= 4 ? new Date(Number(ga[3]) * 1000) : undefined;

  // _ga_<ID> = GS1.1.<session start>.<session count>.… (old) or GS2.1.s<start>$o<count>$… (new)
  let sessionCount: number | undefined;
  let sessionStart: Date | undefined;
  const session = Object.entries(cookies).find(([name]) => name.startsWith("_ga_"))?.[1];
  if (session?.startsWith("GS1")) {
    const parts = session.split(".");
    sessionStart = new Date(Number(parts[2]) * 1000);
    sessionCount = Number(parts[3]);
  } else if (session?.startsWith("GS2")) {
    const fields = Object.fromEntries(
      session
        .split(".")
        .slice(2)
        .join(".")
        .split("$")
        .map((field) => [field[0], field.slice(1)]),
    );
    sessionStart = fields.s ? new Date(Number(fields.s) * 1000) : undefined;
    sessionCount = fields.o ? Number(fields.o) : undefined;
  }

  return {
    names: Object.keys(cookies),
    gaClientId: clientId,
    firstVisit,
    sessionCount,
    sessionStart,
    localStorageKeys: Object.keys(localStorage),
  };
}

export type CookieInfo = ReturnType<typeof readCookies>;

// ---------------------------------------------------------------------------
// Opt-in lookups
// ---------------------------------------------------------------------------

export interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  org?: string;
  asn?: string;
  source: string;
}

/** Sends the visitor's IP to a public geo-IP API. Only call on explicit user action. */
export async function lookupIp(): Promise<IpInfo> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const d = await res.json();
    if (!res.ok || d.error) throw new Error(d.reason ?? "ipapi.co failed");
    return {
      ip: d.ip,
      city: d.city,
      region: d.region,
      country: d.country_name,
      postal: d.postal,
      latitude: d.latitude,
      longitude: d.longitude,
      org: d.org,
      asn: d.asn,
      source: "ipapi.co",
    };
  } catch {
    const res = await fetch("https://ipwho.is/");
    const d = await res.json();
    if (!d.success) throw new Error(d.message ?? "ipwho.is failed");
    return {
      ip: d.ip,
      city: d.city,
      region: d.region,
      country: d.country,
      postal: d.postal,
      latitude: d.latitude,
      longitude: d.longitude,
      org: d.connection?.isp ?? d.connection?.org,
      asn: d.connection?.asn ? `AS${d.connection.asn}` : undefined,
      source: "ipwho.is",
    };
  }
}

export interface PreciseLocation {
  latitude: number;
  longitude: number;
  accuracyM: number;
  altitude: number | null;
  speed: number | null;
}

export function requestPreciseLocation(): Promise<PreciseLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation is not supported"));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyM: Math.round(coords.accuracy),
          altitude: coords.altitude,
          speed: coords.speed,
        }),
      reject,
      { enableHighAccuracy: true, timeout: 15000 },
    );
  });
}

/** Great-circle distance in km. */
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
