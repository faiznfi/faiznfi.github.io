import type { ArrivalInfo, AsyncInfo, CookieInfo, IpInfo, PreciseLocation, StaticInfo } from "./collectors";
import type { BehaviorSnapshot } from "./useBehavior";

/**
 * Turns raw signals into the kind of plain-language profile an ad-tech or
 * data broker would build. Every sentence is derived only from data this page
 * read in the visitor's browser.
 */

interface ProfileInput {
  info: StaticInfo;
  extra?: AsyncInfo;
  arrival: ArrivalInfo;
  cookies: CookieInfo;
  ip?: IpInfo;
  precise?: PreciseLocation;
  behavior: BehaviorSnapshot;
  fingerprintId?: string;
  cameraOn?: boolean;
}

function languageName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function timeOfDay(date: Date) {
  const hour = date.getHours();
  const weekday = date.getDay() >= 1 && date.getDay() <= 5;
  if (hour < 5) return "in the middle of the night";
  if (hour < 9) return "early in the morning";
  if (hour < 17) return weekday ? "during working hours on a weekday" : "during the day on a weekend";
  if (hour < 21) return "in the evening";
  return "late at night";
}

/** "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)" -> "NVIDIA GeForce RTX 3060" */
export function cleanGpuName(renderer: string) {
  const angle = /^ANGLE \((.*)\)$/.exec(renderer);
  const name = angle ? (angle[1].split(", ")[1] ?? angle[1]) : renderer;
  return name
    .replace(/^ANGLE \w+ Renderer: /, "")
    .replace(/\s*\(0x[0-9a-f]+\)/gi, "")
    .replace(/\s+(Direct3D|OpenGL|Vulkan).*$/i, "")
    .trim();
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function buildProfile({ info, extra, arrival, cookies, ip, precise, behavior, fingerprintId, cameraOn }: ProfileInput) {
  const lines: string[] = [];
  const now = new Date();
  const offset = `UTC${info.utcOffset >= 0 ? "+" : ""}${info.utcOffset}`;

  // Location
  if (precise) {
    lines.push(
      `You are within ${precise.accuracyM} m of ${precise.latitude.toFixed(5)}, ${precise.longitude.toFixed(5)}. That's precise enough to identify your building.`,
    );
  } else if (ip) {
    const place = [ip.city, ip.region, ip.country].filter(Boolean).join(", ");
    lines.push(`You're probably in ${place}, online through ${ip.org ?? "an unknown provider"} (IP ${ip.ip}).`);
  } else {
    if (info.timeZone.includes("/")) {
      const city = info.timeZone.split("/").pop()?.replace(/_/g, " ");
      lines.push(`Your clock is set to ${info.timeZone} (${offset}), so you're most likely somewhere near ${city}.`);
    } else {
      lines.push(
        `Your clock is set to ${info.timeZone}. That's unusual for a person: servers, VPNs and privacy browsers do that, which is a signal in itself.`,
      );
    }
  }

  if (cameraOn) lines.push("Your camera is on. I can see your face right now, and I already took a photo without asking.");

  // Time
  lines.push(
    `It's ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} on a ${now.toLocaleDateString("en-GB", { weekday: "long" })} for you. You're browsing ${timeOfDay(now)}.`,
  );

  // Device
  const model = extra?.highEntropy?.model;
  const device = info.mobile ? (model ? `a ${model}` : "a phone or tablet") : "a computer";
  lines.push(`You're using ${device} running ${info.os}, browsing with ${info.browser}.`);
  if (info.cores || info.memoryGb || info.gpuRenderer) {
    const highEnd = (info.cores ?? 0) >= 8 && (info.memoryGb ?? 0) >= 8;
    const parts = [
      info.cores && `${info.cores} CPU cores`,
      info.memoryGb && `at least ${info.memoryGb} GB of RAM`,
      info.gpuRenderer && `a ${cleanGpuName(info.gpuRenderer)} GPU`,
    ].filter(Boolean);
    lines.push(`It has ${parts.join(", ")}${highEnd ? ". That's a high-end machine, a useful signal for ad pricing" : ""}.`);
  }
  if (info.inApp) lines.push(`You opened this inside the ${info.inApp} app's built-in browser, not a normal browser.`);

  // Battery & network
  if (extra?.battery) {
    lines.push(`Your battery is at ${extra.battery.level}% and ${extra.battery.charging ? "charging" : "not charging"}.`);
  }
  if (info.effectiveType) {
    lines.push(
      `Your connection behaves like ${info.effectiveType.toUpperCase()} (~${info.downlinkMbps} Mbps, ${info.rttMs} ms latency)${info.saveData ? ", and you've turned on data saver" : ""}.`,
    );
  }

  // Preferences
  const languages = [...new Set(info.languages.map((code) => languageName(code.split("-")[0])))];
  lines.push(`You read ${languages.join(" and ")}${info.darkMode ? ", and you prefer dark mode" : ""}${info.reducedMotion ? ", with reduced motion turned on" : ""}.`);

  // Arrival
  const utm = Object.entries(arrival.utm);
  if (arrival.referrerHost) {
    lines.push(`You arrived from ${arrival.referrerHost}${utm.length ? `, through a link tagged ${utm.map(([k, v]) => `${k}=${v}`).join(", ")}` : ""}.`);
  } else {
    lines.push(
      `There's no referrer: you typed the address, used a bookmark, or came from an app that hides it${utm.length ? `. The link was still tagged ${utm.map(([k, v]) => `${k}=${v}`).join(", ")}` : ""}.`,
    );
  }
  if (arrival.navigationType === "reload") lines.push("You reloaded this page.");
  if (arrival.historyLength > 2) lines.push(`This tab has ${arrival.historyLength} pages in its history.`);

  // Returning visitor
  if (cookies.sessionCount && cookies.firstVisit) {
    lines.push(
      `Google Analytics recognises you: this is visit #${cookies.sessionCount}, and your first visit was on ${formatDate(cookies.firstVisit)}.`,
    );
  } else if (cookies.firstVisit) {
    lines.push(`A Google Analytics cookie has tracked this browser since ${formatDate(cookies.firstVisit)}.`);
  }

  // Behaviour
  lines.push(
    `In ${Math.round(behavior.secondsOnPage)} seconds you've moved your cursor ${Math.round(behavior.pointerDistancePx).toLocaleString("en")} px, clicked ${behavior.clicks} times, scrolled ${behavior.maxScrollPercent}% of the page and left this tab ${behavior.tabSwitches} times.`,
  );

  // Privacy signals
  if (info.doNotTrack || info.globalPrivacyControl) {
    lines.push("Your browser is sending a \"do not track\" signal. It's a request, and most sites ignore it.");
  }

  if (fingerprintId) {
    lines.push(`Clear your cookies and this browser can still be recognised as fingerprint ${fingerprintId}.`);
  }

  return lines;
}
