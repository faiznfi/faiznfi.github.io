import { useRef, useState } from "react";
import { track } from "../lib/analytics";
import { Insight } from "./ui";
import { useCopy } from "./i18n";

const COPY = {
  en: {
    title: 'A "popup" that is just a picture',
    leadA: 'The "sign-in window" below, title bar, address bar and padlock included, is not a window. It\'s HTML drawn inside this page. The padlock and the URL are decorations anyone can paint. Real attacks copy a real login screen here; this one is labelled fake and has no password box. ',
    dragEmph: "Try to drag it off the page.",
    leadB: " You can't, because it was never a real window.",
    signIn: "Sign in",
    fake: "fake",
    signInToContinue: "Sign in to continue",
    emailDisabled: "email (disabled — this is a demo)",
    passwordDisabled: "password (disabled — this is a demo)",
    signInDoes: "Sign in (does nothing)",
    insight:
      'Inside a page, a padlock icon and a URL string prove nothing, they\'re just pixels. Trust only your browser\'s own address bar, outside the page content. If a login "popup" appears, try to drag it outside the browser window: a real OS window can leave; a fake one drawn by the page cannot.',
  },
  id: {
    title: 'Sebuah "popup" yang hanya gambar',
    leadA: '"Jendela masuk" di bawah, lengkap dengan title bar, address bar, dan gembok, bukanlah sebuah jendela. Itu HTML yang digambar di dalam halaman ini. Gembok dan URL-nya hanyalah hiasan yang bisa dilukis siapa saja. Serangan sungguhan menyalin layar login asli di sini; yang ini diberi label palsu dan tidak punya kotak kata sandi. ',
    dragEmph: "Coba seret keluar dari halaman.",
    leadB: " Kamu tidak bisa, karena itu tidak pernah jendela sungguhan.",
    signIn: "Masuk",
    fake: "palsu",
    signInToContinue: "Masuk untuk melanjutkan",
    emailDisabled: "email (nonaktif — ini demo)",
    passwordDisabled: "kata sandi (nonaktif — ini demo)",
    signInDoes: "Masuk (tidak melakukan apa-apa)",
    insight:
      'Di dalam halaman, ikon gembok dan teks URL tidak membuktikan apa pun, itu hanya piksel. Percayai hanya address bar milik browser kamu, di luar konten halaman. Kalau "popup" login muncul, coba seret keluar dari jendela browser: jendela OS sungguhan bisa keluar; yang palsu digambar halaman tidak bisa.',
  },
};

/**
 * Browser-in-the-browser explainer. This is deliberately NOT a working login
 * lure: it imitates no real brand, has no password field, captures nothing,
 * and labels itself as fake. Its only interaction is dragging, to prove the
 * "window" is trapped inside the page and can't leave the real browser frame.
 */
export function FakeWindow() {
  const t = useCopy(COPY);
  const areaRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 40, y: 30 });
  const [dragged, setDragged] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (!dragged) {
      setDragged(true);
      track("whoami_action", { demo_action: "fake_window", demo_result: "started" });
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !areaRef.current) return;
    const area = areaRef.current.getBoundingClientRect();
    // Clamp inside the demo area: the window physically cannot leave the page.
    const x = Math.min(Math.max(0, e.clientX - drag.current.dx), area.width - 300);
    const y = Math.min(Math.max(0, e.clientY - drag.current.dy), area.height - 150);
    setPos({ x, y });
  }
  function onPointerUp(e: React.PointerEvent) {
    drag.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  return (
    <section id="fakewin" aria-labelledby="fw-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[13]</span>
      <h2 id="fw-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {t.title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">
        {t.leadA}
        <span className="text-white">{t.dragEmph}</span>
        {t.leadB}
      </p>

      <div
        ref={areaRef}
        className="mt-8 relative h-[340px] bg-[#0A0A0C] border border-white/10 overflow-hidden"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      >
        <div className="absolute w-[300px] shadow-2xl" style={{ left: pos.x, top: pos.y }}>
          {/* Fake title bar (drag handle) */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="flex items-center gap-2 bg-[#2a2a2e] px-3 py-2 cursor-move touch-none"
          >
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-[11px] text-white/60 font-mono">{t.signIn}</span>
          </div>
          {/* Fake address bar: the padlock and URL are fake on purpose */}
          <div className="flex items-center gap-2 bg-[#1b1b1f] px-3 py-1.5 border-b border-black/40">
            <span className="text-emerald-400 text-xs">🔒</span>
            <span className="text-[11px] text-white/50 font-mono">https://totally-legit-login.example</span>
            <span className="ml-auto text-[9px] text-pink-400 font-mono uppercase">{t.fake}</span>
          </div>
          {/* Inert body: no real inputs, nothing to type into */}
          <div className="bg-[#121216] p-4 border border-[#2a2a2e]">
            <div className="text-sm text-white/70 mb-3">{t.signInToContinue}</div>
            <div className="h-9 bg-[#0A0A0C] border border-white/10 mb-2 flex items-center px-3 text-[11px] text-white/25">{t.emailDisabled}</div>
            <div className="h-9 bg-[#0A0A0C] border border-white/10 mb-3 flex items-center px-3 text-[11px] text-white/25">{t.passwordDisabled}</div>
            <div className="h-9 bg-white/20 flex items-center justify-center text-[11px] text-white/40 uppercase tracking-widest">{t.signInDoes}</div>
          </div>
        </div>
      </div>

      <Insight>{t.insight}</Insight>
    </section>
  );
}
