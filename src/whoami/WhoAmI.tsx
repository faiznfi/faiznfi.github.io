import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "../lib/analytics";
import {
  collectArrival,
  collectAsync,
  collectStatic,
  distanceKm,
  lookupIp,
  readCookies,
  requestPreciseLocation,
  type AsyncInfo,
  type IpInfo,
  type PreciseLocation,
} from "./collectors";
import { computeFingerprint, type Fingerprint } from "./fingerprint";
import { buildProfile } from "./profile";
import { useBehavior } from "./useBehavior";
import { TypingDemo } from "./TypingDemo";
import { DataLayerPanel } from "./DataLayerPanel";
import { Button, Card, Insight, Notice, Row, Rows, Section, Stat } from "./ui";

type Status = "idle" | "loading" | "done" | "error";

const fmtGb = (gb?: number) => (gb === undefined ? undefined : gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(gb * 1024)} MB`);
const fmtDate = (d?: Date) => d?.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function WhoAmI() {
  const info = useMemo(collectStatic, []);
  const arrival = useMemo(collectArrival, []);
  const [cookies, setCookies] = useState(readCookies);
  const [extra, setExtra] = useState<AsyncInfo>();
  const [fingerprint, setFingerprint] = useState<Fingerprint>();

  const [ip, setIp] = useState<IpInfo>();
  const [ipStatus, setIpStatus] = useState<Status>("idle");
  const [ipError, setIpError] = useState<string>();
  const [precise, setPrecise] = useState<PreciseLocation>();
  const [preciseStatus, setPreciseStatus] = useState<Status>("idle");
  const [preciseError, setPreciseError] = useState<string>();

  const trailCanvas = useRef<HTMLCanvasElement>(null);
  const behavior = useBehavior(trailCanvas);

  useEffect(() => {
    collectAsync().then(setExtra);
    computeFingerprint(info).then(setFingerprint);
    // GA cookies are created asynchronously by GTM; read them again shortly after load.
    const id = window.setTimeout(() => setCookies(readCookies()), 2500);
    return () => clearTimeout(id);
  }, [info]);

  const profile = buildProfile({
    info,
    extra,
    arrival,
    cookies,
    ip,
    precise,
    behavior,
    fingerprintId: fingerprint?.id,
  });

  async function onLookupIp() {
    setIpStatus("loading");
    setIpError(undefined);
    try {
      setIp(await lookupIp());
      setIpStatus("done");
      track("whoami_action", { demo_action: "ip_lookup", demo_result: "success" });
    } catch (error) {
      setIpStatus("error");
      setIpError(error instanceof Error ? error.message : "Lookup failed (an ad blocker may have blocked it)");
      track("whoami_action", { demo_action: "ip_lookup", demo_result: "error" });
    }
  }

  async function onPreciseLocation() {
    setPreciseStatus("loading");
    setPreciseError(undefined);
    try {
      setPrecise(await requestPreciseLocation());
      setPreciseStatus("done");
      track("whoami_action", { demo_action: "precise_location", demo_result: "granted" });
    } catch (error) {
      setPreciseStatus("error");
      const denied = error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED;
      setPreciseError(denied ? "You said no. Good instinct." : error instanceof Error ? error.message : "Location unavailable");
      track("whoami_action", { demo_action: "precise_location", demo_result: denied ? "denied" : "error" });
    }
    collectAsync().then(setExtra); // refresh permission states
  }

  const he = extra?.highEntropy;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E6] font-sans selection:bg-cyan-500/30">
      {/* Live cursor trail covers the whole viewport, behind the content. */}
      <canvas
        ref={trailCanvas}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />

      <div className="relative z-10 container mx-auto max-w-5xl px-6">
        <header className="flex items-center justify-between py-6 font-mono text-xs">
          <a href="/" className="text-white/50 hover:text-cyan-400 transition-colors">
            ← faiznfi.github.io
          </a>
          <span className="text-white/40 tabular-nums">
            observing you for <span className="text-cyan-400">{Math.floor(behavior.secondsOnPage)}s</span>
          </span>
        </header>

        {/* Intro */}
        <div className="pt-12 pb-16">
          <span className="font-mono text-cyan-500 text-xs">$ whoami</span>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            You didn't tell me anything.
            <br />
            <span className="text-white/40 italic font-light">I know this anyway.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
            Any website you open can read everything on this page. Many do, and send it to analytics, advertising and
            "customer data" platforms. This page does the same reading, then shows you the result instead of sending it away.
          </p>
          <div className="mt-8 max-w-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200/90 leading-relaxed">
            <strong className="font-mono text-xs uppercase tracking-widest text-emerald-400">Nothing is stored.</strong>{" "}
            Everything below is computed in your browser and disappears when you close the tab. There are two exceptions,
            and both are shown openly: this site runs Google Analytics, which records an anonymous page view and which
            demo buttons you press (see <a href="#sent" className="underline">section 09</a>), and the IP lookup
            button sends your IP to a geo-IP service, only if you press it.
          </div>
        </div>

        {/* 00 — Profile */}
        <section aria-labelledby="profile-title" className="pb-16">
          <Card className="border-cyan-500/20">
            <h2 id="profile-title" className="font-mono text-[11px] uppercase tracking-widest text-cyan-400 mb-4">
              [00] Your profile, as a data broker would write it
            </h2>
            <ul className="space-y-3">
              {profile.map((line) => (
                <li key={line.slice(0, 40)} className="flex gap-3 text-[15px] leading-relaxed text-white/85">
                  <span aria-hidden="true" className="text-cyan-500">▹</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* 01 — Location */}
        <Section
          id="location"
          index="01"
          title="Where you are"
          lead="Your location leaks three ways: your clock settings (free, silent), your IP address (silent for the website), and GPS (needs your permission)."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="1 · Timezone (silent)">
              <Rows>
                <Row label="Timezone" value={info.timeZone} />
                <Row label="UTC offset" value={`UTC${info.utcOffset >= 0 ? "+" : ""}${info.utcOffset}`} />
                <Row label="Locale" value={info.locale} />
                <Row label="Local time" value={new Date().toLocaleTimeString("en-GB")} />
              </Rows>
            </Card>

            <Card title="2 · IP address">
              {ip ? (
                <Rows>
                  <Row label="IP" value={ip.ip} />
                  <Row label="City" value={ip.city} />
                  <Row label="Region" value={ip.region} />
                  <Row label="Country" value={ip.country} />
                  <Row label="Postal code" value={ip.postal} />
                  <Row label="ISP / org" value={ip.org} hint={ip.asn} />
                  <Row label="Approx. coordinates" value={ip.latitude && `${ip.latitude}, ${ip.longitude}`} />
                </Rows>
              ) : (
                <p className="text-sm text-white/60 leading-relaxed">
                  Every server you connect to sees your IP; it's how the internet routes the reply. A website's server
                  logs it automatically. This static page has no server of its own, so to show it, your IP has to be
                  sent to a geo-IP service.
                </p>
              )}
              <div className="mt-4">
                <Button onClick={onLookupIp} disabled={ipStatus === "loading"}>
                  {ipStatus === "loading" ? "Looking up…" : ip ? "Look up again" : "Look up my IP"}
                </Button>
              </div>
              {ip && <p className="mt-2 text-[11px] text-white/35">via {ip.source}</p>}
              {ipError && <Notice>{ipError}</Notice>}
            </Card>

            <Card title="3 · GPS (asks permission)">
              {precise ? (
                <Rows>
                  <Row label="Latitude" value={precise.latitude.toFixed(6)} />
                  <Row label="Longitude" value={precise.longitude.toFixed(6)} />
                  <Row label="Accuracy" value={`± ${precise.accuracyM} m`} />
                  <Row label="Altitude" value={precise.altitude && `${Math.round(precise.altitude)} m`} />
                  <Row
                    label="Distance from IP guess"
                    value={
                      ip?.latitude !== undefined && ip.longitude !== undefined
                        ? `${distanceKm(precise, { latitude: ip.latitude, longitude: ip.longitude }).toFixed(1)} km`
                        : undefined
                    }
                  />
                </Rows>
              ) : (
                <p className="text-sm text-white/60 leading-relaxed">
                  The browser will ask before sharing this. Many people click "Allow" without reading, often because a
                  store locator or delivery app asked first.
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={onPreciseLocation} disabled={preciseStatus === "loading"}>
                  {preciseStatus === "loading" ? "Waiting for you…" : "Share precise location"}
                </Button>
                {precise && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${precise.latitude}&mlon=${precise.longitude}#map=18/${precise.latitude}/${precise.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 underline underline-offset-4"
                  >
                    Open on map ↗
                  </a>
                )}
              </div>
              {preciseError && <Notice>{preciseError}</Notice>}
            </Card>
          </div>
          <Insight>
            Location data is a pattern, not one point. Where your phone sleeps is your home; where it spends 9 to 5 is
            your workplace. Data brokers sell exactly this, built from apps that asked for location once.
          </Insight>
        </Section>

        {/* 02 — Device */}
        <Section
          id="device"
          index="02"
          title="Your device"
          lead="Your browser describes your hardware in detail. No prompt and no permission."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="System">
              <Rows>
                <Row label="Device type" value={info.mobile ? "Phone / tablet" : "Desktop / laptop"} />
                <Row label="Operating system" value={info.os} hint={he?.platformVersion && `platform version ${he.platformVersion}`} />
                <Row label="Device model" value={he?.model} hint="Exposed by Chromium on Android" />
                <Row label="CPU architecture" value={he?.architecture && `${he.architecture} ${he.bitness ?? ""}-bit`} />
                <Row label="CPU cores" value={info.cores} />
                <Row label="RAM (rounded)" value={info.memoryGb && `≥ ${info.memoryGb} GB`} />
                <Row label="GPU vendor" value={info.gpuVendor} />
                <Row label="GPU model" value={info.gpuRenderer} />
                <Row label="Storage quota" value={fmtGb(extra?.storageQuotaGb)} hint="Often proportional to free disk space; very small in private windows" />
              </Rows>
            </Card>
            <Card title="Screen, power & peripherals">
              <Rows>
                <Row label="Screen" value={info.screen} />
                <Row label="Usable screen" value={info.availScreen} hint="The difference reveals taskbar / dock size" />
                <Row label="Browser window" value={info.viewport} />
                <Row label="Pixel ratio" value={`${info.pixelRatio}×`} />
                <Row label="Colour depth" value={`${info.colorDepth}-bit`} />
                <Row label="Orientation" value={info.orientation} />
                <Row label="Touch points" value={info.touchPoints} />
                <Row label="Mouse / trackpad" value={info.hoverCapable} />
                <Row
                  label="Battery"
                  value={extra?.battery && `${extra.battery.level}% · ${extra.battery.charging ? "charging" : "on battery"}`}
                />
                <Row
                  label="Cameras / mics / speakers"
                  value={extra?.cameras !== undefined ? `${extra.cameras} / ${extra.microphones} / ${extra.speakers}` : undefined}
                  hint="Counted without asking; names need permission"
                />
              </Rows>
            </Card>
          </div>
          <Insight>
            Hardware is a price signal. Booking and e-commerce sites have been caught showing different prices or
            products to visitors on expensive devices. It's also a fingerprinting ingredient (see section 05).
          </Insight>
        </Section>

        {/* 03 — Browser & preferences */}
        <Section
          id="browser"
          index="03"
          title="Your browser & habits"
          lead="Settings you chose once quietly describe who you are: which languages you read, whether you use dark mode, whether you need accessibility features."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Browser">
              <Rows>
                <Row label="Browser" value={info.browser} />
                <Row label="In-app browser" value={info.inApp ?? "No"} />
                <Row label="Full versions" value={he?.fullVersionList?.map((b) => `${b.brand} ${b.version}`).join(", ")} />
                <Row label="User agent" value={info.ua} />
                <Row label="Automated (webdriver)" value={info.webdriver} hint="Bots and test tools often say yes" />
                <Row label="Cookies enabled" value={info.cookiesEnabled} />
                <Row label="Built-in PDF viewer" value={info.pdfViewer} />
              </Rows>
            </Card>
            <Card title="Preferences & signals">
              <Rows>
                <Row label="Languages" value={info.languages.join(", ")} />
                <Row label="Dark mode" value={info.darkMode} />
                <Row label="Reduced motion" value={info.reducedMotion} hint="An accessibility setting" />
                <Row label="High contrast" value={info.highContrast} hint="An accessibility setting" />
                <Row label="Forced colours" value={info.forcedColors} />
                <Row label="Network" value={info.effectiveType && `${info.effectiveType} · ${info.downlinkMbps} Mbps · ${info.rttMs} ms`} />
                <Row label="Data saver" value={info.saveData} />
                <Row label="Do Not Track" value={info.doNotTrack} hint="A request. Sites can and do ignore it" />
                <Row label="Global Privacy Control" value={info.globalPrivacyControl} hint="Legally binding in some US states" />
              </Rows>
            </Card>
            <Card title="Permissions you've already given this site" className="lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(extra?.permissions ?? {}).map(([name, state]) => (
                  <div key={name} className="flex items-center justify-between border border-white/5 px-3 py-2 font-mono text-xs">
                    <span className="text-white/60">{name}</span>
                    <span className={state === "granted" ? "text-pink-400" : state === "denied" ? "text-emerald-400" : "text-white/40"}>
                      {state}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">A site can check these without showing a prompt.</p>
            </Card>
          </div>
          <Insight>
            Accessibility settings (reduced motion, high contrast, forced colours) can hint at a disability, which is
            sensitive personal data under most privacy laws, including Indonesia's UU PDP.
          </Insight>
        </Section>

        {/* 04 — Arrival & memory */}
        <Section
          id="arrival"
          index="04"
          title="How you got here, and whether I remember you"
          lead="The link you clicked carries information, and cookies let a site recognise you on your next visit."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Arrival">
              <Rows>
                <Row label="Referrer" value={arrival.referrer} hint="The page you came from" />
                {Object.entries(arrival.utm).map(([key, value]) => (
                  <Row key={key} label={key} value={value} hint={key.endsWith("clid") ? "Ad click ID: ties this visit to a specific ad click" : undefined} />
                ))}
                <Row label="Navigation type" value={arrival.navigationType} hint="navigate · reload · back_forward" />
                <Row label="Pages in this tab's history" value={arrival.historyLength} />
                <Row label="Network protocol" value={arrival.timing?.protocol} />
                <Row label="DNS / connect / first byte" value={arrival.timing && `${arrival.timing.dnsMs} / ${arrival.timing.connectMs} / ${arrival.timing.ttfbMs} ms`} />
              </Rows>
            </Card>
            <Card title="Cookies on this site">
              <Rows>
                <Row label="Cookies present" value={cookies.names.join(", ") || "none yet"} />
                <Row label="Google Analytics ID" value={cookies.gaClientId} hint="Random, but follows you on every visit until you clear cookies" />
                <Row label="First visit" value={fmtDate(cookies.firstVisit)} hint="Encoded inside the _ga cookie" />
                <Row label="Visit number" value={cookies.sessionCount} />
                <Row label="This session started" value={fmtDate(cookies.sessionStart)} />
                <Row label="localStorage keys" value={cookies.localStorageKeys.join(", ") || "none"} />
              </Rows>
            </Card>
          </div>
          <Insight>
            UTM tags and ad click IDs (gclid, fbclid, ttclid) in a link tell a site which campaign, post or person sent
            you. The _ga cookie turns separate visits into one history. Third-party cookies used to do the same across
            different websites.
          </Insight>
        </Section>

        {/* 05 — Fingerprint */}
        <Section
          id="fingerprint"
          index="05"
          title="Your fingerprint"
          lead="Small differences in how your device draws graphics, plays audio and which fonts it has add up to an ID that survives clearing cookies and private browsing."
        >
          <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
            <Card title="Fingerprint ID">
              <div className="font-mono text-2xl md:text-3xl text-pink-400 break-all">{fingerprint?.id ?? "computing…"}</div>
              <p className="mt-3 text-sm text-white/60">
                Reload the page, or open it in a private window: in most browsers this stays the same. Browsers with
                anti-fingerprinting (Brave, Tor, Firefox with resistFingerprinting, Safari) add noise to it.
              </p>
              {fingerprint?.canvasImage && (
                <div className="mt-5">
                  <div className="text-xs text-white/40 mb-2">The hidden image used for canvas fingerprinting:</div>
                  <img src={fingerprint.canvasImage} alt="Canvas fingerprint test image" className="w-full border border-white/10" />
                </div>
              )}
            </Card>
            <Card title="Ingredients">
              <Rows>
                {fingerprint &&
                  Object.entries(fingerprint.components).map(([key, value]) => (
                    <Row key={key} label={key} value={key === "fonts" ? `${fingerprint.fonts.length} detected` : value} />
                  ))}
              </Rows>
              {fingerprint && fingerprint.fonts.length > 0 && (
                <p className="mt-3 text-xs text-white/50 leading-relaxed">
                  <span className="text-white/30">Installed fonts found: </span>
                  {fingerprint.fonts.join(", ")}
                </p>
              )}
            </Card>
          </div>
          <Insight>
            Fingerprinting needs no cookie, so cookie banners and "clear browsing data" don't touch it. Installed fonts
            can even reveal software you use (Office, Adobe, developer tools) and the languages you write.
          </Insight>
        </Section>

        {/* 06 — Behaviour */}
        <Section
          id="behavior"
          index="06"
          title="What you're doing right now"
          lead="Analytics and session-replay tools record every movement. The cyan line following your cursor is that recording, replayed live. Pink circles are your clicks."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Stat label="Seconds on page" value={Math.floor(behavior.secondsOnPage)} />
            <Stat label="Seconds actually looking" value={Math.floor(behavior.visibleSeconds)} hint="Tab visible" />
            <Stat label="Seconds idle" value={Math.floor(behavior.idleSeconds)} hint="Since your last input" />
            <Stat label="Times you left this tab" value={behavior.tabSwitches} />
            <Stat label="Max scroll depth" value={`${behavior.maxScrollPercent}%`} />
            <Stat label="Cursor travel" value={`${Math.round(behavior.pointerDistancePx).toLocaleString("en")} px`} />
            <Stat label="Clicks" value={behavior.clicks} hint={behavior.lastClickTarget} />
            <Stat label="Rage clicks" value={behavior.rageClicks} hint="3 fast clicks in one spot" />
            <Stat label="Keys pressed" value={behavior.keystrokes} />
            <Stat label="Window lost focus" value={behavior.windowBlurs} />
            <Stat label="Window resizes" value={behavior.resizes} />
            <Stat label="Copies" value={behavior.copies} hint={behavior.lastCopied && `"${behavior.lastCopied}"`} />
          </div>
          <Insight>
            Try selecting and copying any text on this page; it shows up above. Sites use this to see which prices,
            addresses or code snippets people copy. Session-replay tools rebuild a video of your visit from these events.
          </Insight>
        </Section>

        {/* 07 — Typing */}
        <Section
          id="typing"
          index="07"
          title="What you type, before you submit"
          lead="A form is readable while you're still filling it in."
        >
          <TypingDemo />
        </Section>

        {/* 08 — The point */}
        <Section
          id="combine"
          index="08"
          title="Why combining is the real danger"
          lead="No single item above identifies you. Together, they do."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="Identify">
              <p className="text-sm text-white/70 leading-relaxed">
                Timezone + language + screen + GPU + fonts is often unique among millions of browsers. If you log in
                anywhere, that profile gets your name.
              </p>
            </Card>
            <Card title="Follow">
              <p className="text-sm text-white/70 leading-relaxed">
                The same tracking script (analytics, ad pixels, social buttons) on thousands of sites links your visits
                into one browsing history.
              </p>
            </Card>
            <Card title="Infer">
              <p className="text-sm text-white/70 leading-relaxed">
                From the history, models infer income, health, religion, relationship status or a job search. Then they
                sell the segment, not the raw data.
              </p>
            </Card>
          </div>
        </Section>

        {/* 09 — What this page sent */}
        <Section
          id="sent"
          index="09"
          title="What this page actually sent"
          lead="Below is every event this page pushed to Google Tag Manager. Compare it with everything above: none of the values shown on this page are in it."
        >
          <DataLayerPanel />
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            Google Analytics itself also receives the standard page-view data every site using it receives: page URL,
            referrer, screen size, language, and a city-level location that Google derives from your IP. Google says it
            does not store the IP in Analytics. This page adds no personal data on top of that.
          </p>
        </Section>

        {/* 10 — Protect yourself */}
        <Section id="protect" index="10" title="How to protect yourself" lead="You can't hide everything. You can make it much harder.">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Use a privacy-focused browser", "Brave, Firefox (strict tracking protection), Safari, or Tor Browser for maximum anonymity. They block trackers and randomise fingerprints."],
              ["Install a content blocker", "uBlock Origin blocks most analytics, ad pixels and session-replay scripts before they load."],
              ["Say no to permissions", "Deny location, notifications, camera and microphone by default. Grant them per visit, never \"always\"."],
              ["Hide your IP", "A trustworthy VPN or iCloud Private Relay hides your real IP and location from the sites you visit."],
              ["Strip tracking links", "Remove ?utm_…, fbclid, gclid and similar from links before sharing them. Some browsers do this automatically."],
              ["Separate identities", "Use different browsers or containers for work, shopping and social media, so their profiles don't merge."],
              ["Clear cookies regularly", "Or set your browser to clear them on exit. It won't stop fingerprinting, but it resets ID cookies like _ga."],
              ["Be careful what you type", "Assume anything typed into a web form can be read before you hit submit."],
            ].map(([title, text]) => (
              <Card key={title} title={title}>
                <p className="text-sm text-white/70 leading-relaxed">{text}</p>
              </Card>
            ))}
          </div>
        </Section>

        <footer className="border-t border-white/5 py-10 font-mono text-[11px] text-white/40 flex flex-col sm:flex-row justify-between gap-4">
          <span>Built for a data-tracking lecture by Faiz Insani · nothing on this page is stored.</span>
          <a href="/" className="text-cyan-400 hover:text-cyan-300">faiznfi.github.io</a>
        </footer>
      </div>
    </div>
  );
}
