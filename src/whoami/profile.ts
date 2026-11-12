import type { ArrivalInfo, AsyncInfo, CookieInfo, IpInfo, PreciseLocation, StaticInfo } from "./collectors";
import type { BehaviorSnapshot } from "./useBehavior";
import type { Lang } from "./i18n";

/**
 * Turns raw signals into the kind of plain-language profile an ad-tech or
 * data broker would build, in English or Indonesian. Every sentence is derived
 * only from data this page read in the visitor's browser.
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

function languageName(code: string, lang: Lang) {
  try {
    return new Intl.DisplayNames([lang], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function timeOfDay(date: Date, id: boolean) {
  const hour = date.getHours();
  const weekday = date.getDay() >= 1 && date.getDay() <= 5;
  if (hour < 5) return id ? "di tengah malam" : "in the middle of the night";
  if (hour < 9) return id ? "pagi-pagi sekali" : "early in the morning";
  if (hour < 17) return id ? (weekday ? "di jam kerja pada hari kerja" : "di siang hari saat akhir pekan") : weekday ? "during working hours on a weekday" : "during the day on a weekend";
  if (hour < 21) return id ? "di malam hari" : "in the evening";
  return id ? "larut malam" : "late at night";
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

export function buildProfile(
  { info, extra, arrival, cookies, ip, precise, behavior, fingerprintId, cameraOn }: ProfileInput,
  lang: Lang = "en",
) {
  const id = lang === "id";
  const locale = id ? "id-ID" : "en-GB";
  const lines: string[] = [];
  const now = new Date();
  const offset = `UTC${info.utcOffset >= 0 ? "+" : ""}${info.utcOffset}`;
  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Location
  if (precise) {
    const lat = precise.latitude.toFixed(5);
    const lng = precise.longitude.toFixed(5);
    lines.push(
      id
        ? `Kamu berada dalam radius ${precise.accuracyM} m dari ${lat}, ${lng}. Itu cukup presisi untuk mengidentifikasi gedungmu.`
        : `You are within ${precise.accuracyM} m of ${lat}, ${lng}. That's precise enough to identify your building.`,
    );
  } else if (ip) {
    const place = [ip.city, ip.region, ip.country].filter(Boolean).join(", ");
    const org = ip.org ?? (id ? "penyedia yang tidak diketahui" : "an unknown provider");
    lines.push(
      id
        ? `Kamu kemungkinan di ${place}, online lewat ${org} (IP ${ip.ip}).`
        : `You're probably in ${place}, online through ${org} (IP ${ip.ip}).`,
    );
  } else if (info.timeZone.includes("/")) {
    const city = info.timeZone.split("/").pop()?.replace(/_/g, " ");
    lines.push(
      id
        ? `Jam kamu diatur ke ${info.timeZone} (${offset}), jadi kamu kemungkinan besar berada di dekat ${city}.`
        : `Your clock is set to ${info.timeZone} (${offset}), so you're most likely somewhere near ${city}.`,
    );
  } else {
    lines.push(
      id
        ? `Jam kamu diatur ke ${info.timeZone}. Itu tidak biasa untuk orang: server, VPN, dan browser privasi melakukannya, yang merupakan sinyal tersendiri.`
        : `Your clock is set to ${info.timeZone}. That's unusual for a person: servers, VPNs and privacy browsers do that, which is a signal in itself.`,
    );
  }

  if (cameraOn) {
    lines.push(
      id
        ? "Kamera kamu menyala. Aku bisa melihat wajahmu sekarang, dan aku sudah mengambil foto tanpa bertanya."
        : "Your camera is on. I can see your face right now, and I already took a photo without asking.",
    );
  }

  // Time
  const time = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const weekday = now.toLocaleDateString(locale, { weekday: "long" });
  lines.push(
    id
      ? `Sekarang jam ${time} di hari ${weekday} buat kamu. Kamu menjelajah ${timeOfDay(now, true)}.`
      : `It's ${time} on a ${weekday} for you. You're browsing ${timeOfDay(now, false)}.`,
  );

  // Device
  const model = extra?.highEntropy?.model;
  const device = info.mobile
    ? model
      ? id
        ? `sebuah ${model}`
        : `a ${model}`
      : id
        ? "HP atau tablet"
        : "a phone or tablet"
    : id
      ? "sebuah komputer"
      : "a computer";
  lines.push(
    id
      ? `Kamu memakai ${device} dengan ${info.os}, menjelajah pakai ${info.browser}.`
      : `You're using ${device} running ${info.os}, browsing with ${info.browser}.`,
  );
  if (info.cores || info.memoryGb || info.gpuRenderer) {
    const highEnd = (info.cores ?? 0) >= 8 && (info.memoryGb ?? 0) >= 8;
    const parts = [
      info.cores && (id ? `${info.cores} inti CPU` : `${info.cores} CPU cores`),
      info.memoryGb && (id ? `setidaknya ${info.memoryGb} GB RAM` : `at least ${info.memoryGb} GB of RAM`),
      info.gpuRenderer && (id ? `GPU ${cleanGpuName(info.gpuRenderer)}` : `a ${cleanGpuName(info.gpuRenderer)} GPU`),
    ].filter(Boolean);
    const tail = highEnd
      ? id
        ? ". Itu mesin kelas atas, sinyal yang berguna untuk penetapan harga iklan"
        : ". That's a high-end machine, a useful signal for ad pricing"
      : "";
    lines.push(id ? `Perangkatnya punya ${parts.join(", ")}${tail}.` : `It has ${parts.join(", ")}${tail}.`);
  }
  if (info.inApp) {
    lines.push(
      id
        ? `Kamu membuka ini di dalam browser bawaan aplikasi ${info.inApp}, bukan browser biasa.`
        : `You opened this inside the ${info.inApp} app's built-in browser, not a normal browser.`,
    );
  }

  // Battery & network
  if (extra?.battery) {
    lines.push(
      id
        ? `Baterai kamu di ${extra.battery.level}% dan ${extra.battery.charging ? "sedang mengisi" : "tidak mengisi"}.`
        : `Your battery is at ${extra.battery.level}% and ${extra.battery.charging ? "charging" : "not charging"}.`,
    );
  }
  if (info.effectiveType) {
    const saver = info.saveData ? (id ? ", dan kamu mengaktifkan hemat data" : ", and you've turned on data saver") : "";
    lines.push(
      id
        ? `Koneksi kamu berperilaku seperti ${info.effectiveType.toUpperCase()} (~${info.downlinkMbps} Mbps, latensi ${info.rttMs} ms)${saver}.`
        : `Your connection behaves like ${info.effectiveType.toUpperCase()} (~${info.downlinkMbps} Mbps, ${info.rttMs} ms latency)${saver}.`,
    );
  }

  // Preferences
  const languages = [...new Set(info.languages.map((code) => languageName(code.split("-")[0], lang)))];
  const dark = info.darkMode ? (id ? ", dan kamu lebih suka mode gelap" : ", and you prefer dark mode") : "";
  const reduced = info.reducedMotion ? (id ? ", dengan animasi dikurangi" : ", with reduced motion turned on") : "";
  lines.push(
    id
      ? `Kamu membaca ${languages.join(" dan ")}${dark}${reduced}.`
      : `You read ${languages.join(" and ")}${dark}${reduced}.`,
  );

  // Arrival
  const utm = Object.entries(arrival.utm);
  const tags = utm.map(([k, v]) => `${k}=${v}`).join(", ");
  if (arrival.referrerHost) {
    const via = utm.length ? (id ? `, lewat tautan bertanda ${tags}` : `, through a link tagged ${tags}`) : "";
    lines.push(id ? `Kamu datang dari ${arrival.referrerHost}${via}.` : `You arrived from ${arrival.referrerHost}${via}.`);
  } else {
    const via = utm.length ? (id ? `. Tautannya tetap bertanda ${tags}` : `. The link was still tagged ${tags}`) : "";
    lines.push(
      id
        ? `Tidak ada referrer: kamu mengetik alamatnya, memakai bookmark, atau datang dari aplikasi yang menyembunyikannya${via}.`
        : `There's no referrer: you typed the address, used a bookmark, or came from an app that hides it${via}.`,
    );
  }
  if (arrival.navigationType === "reload") lines.push(id ? "Kamu memuat ulang halaman ini." : "You reloaded this page.");
  if (arrival.historyLength > 2) {
    lines.push(
      id ? `Tab ini punya ${arrival.historyLength} halaman di riwayatnya.` : `This tab has ${arrival.historyLength} pages in its history.`,
    );
  }

  // Returning visitor
  if (cookies.sessionCount && cookies.firstVisit) {
    lines.push(
      id
        ? `Google Analytics mengenalimu: ini kunjungan ke-${cookies.sessionCount}, dan kunjungan pertamamu pada ${formatDate(cookies.firstVisit)}.`
        : `Google Analytics recognises you: this is visit #${cookies.sessionCount}, and your first visit was on ${formatDate(cookies.firstVisit)}.`,
    );
  } else if (cookies.firstVisit) {
    lines.push(
      id
        ? `Sebuah cookie Google Analytics telah melacak browser ini sejak ${formatDate(cookies.firstVisit)}.`
        : `A Google Analytics cookie has tracked this browser since ${formatDate(cookies.firstVisit)}.`,
    );
  }

  // Behaviour
  const px = Math.round(behavior.pointerDistancePx).toLocaleString(id ? "id-ID" : "en");
  lines.push(
    id
      ? `Dalam ${Math.round(behavior.secondsOnPage)} detik kamu telah menggerakkan kursor ${px} px, mengklik ${behavior.clicks} kali, scroll ${behavior.maxScrollPercent}% halaman, dan meninggalkan tab ini ${behavior.tabSwitches} kali.`
      : `In ${Math.round(behavior.secondsOnPage)} seconds you've moved your cursor ${px} px, clicked ${behavior.clicks} times, scrolled ${behavior.maxScrollPercent}% of the page and left this tab ${behavior.tabSwitches} times.`,
  );

  // Privacy signals
  if (info.doNotTrack || info.globalPrivacyControl) {
    lines.push(
      id
        ? 'Browser kamu mengirim sinyal "do not track". Itu sekadar permintaan, dan sebagian besar situs mengabaikannya.'
        : 'Your browser is sending a "do not track" signal. It\'s a request, and most sites ignore it.',
    );
  }

  if (fingerprintId) {
    lines.push(
      id
        ? `Hapus cookie kamu dan browser ini masih bisa dikenali sebagai fingerprint ${fingerprintId}.`
        : `Clear your cookies and this browser can still be recognised as fingerprint ${fingerprintId}.`,
    );
  }

  return lines;
}
