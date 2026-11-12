import { useState } from "react";
import { track } from "../lib/analytics";
import { Insight } from "./ui";
import { useCopy } from "./i18n";

const COPY = {
  en: {
    title: "The button you see isn't the button you click",
    lead: 'Clickjacking stacks an invisible layer over a friendly-looking button. You aim for "Claim your prize"; your click lands on something hidden, like "Allow" or "Confirm payment". Below, nothing real happens, and the slider lets you fade the hidden layer in so you can see the trick.',
    prize: "🎁 Claim your free prize",
    hidden: "⚠ Allow this site to post as you",
    reveal: "Reveal the hidden layer:",
    hitsTitle: "What your clicks actually hit",
    hitsHint: "Click the prize button a few times.",
    everyA: "Every click hit the ",
    hiddenWord: "hidden",
    everyB: " button, never the prize, even at 0% opacity.",
    revealedNote: "Now you can see it. A real attack keeps it at 0%.",
    insightA:
      'Real clickjacking can\'t hide the browser\'s own camera or location prompt, but it can steal clicks on buttons inside a page: a like, a follow, a "confirm", an in-page "allow". Sites defend with an ',
    insightB: " header that stops others embedding them. As a visitor: be wary of pages that rush you to click something shiny.",
  },
  id: {
    title: "Tombol yang kamu lihat bukan tombol yang kamu klik",
    lead: 'Clickjacking menumpuk lapisan tak terlihat di atas tombol yang terlihat ramah. Kamu membidik "Klaim hadiahmu"; klikmu mendarat di sesuatu yang tersembunyi, seperti "Izinkan" atau "Konfirmasi pembayaran". Di bawah, tidak ada yang benar-benar terjadi, dan slider membiarkanmu memunculkan lapisan tersembunyi agar kamu bisa melihat triknya.',
    prize: "🎁 Klaim hadiah gratismu",
    hidden: "⚠ Izinkan situs ini memposting atas namamu",
    reveal: "Tampilkan lapisan tersembunyi:",
    hitsTitle: "Yang sebenarnya kena klikmu",
    hitsHint: "Klik tombol hadiah beberapa kali.",
    everyA: "Setiap klik mengenai tombol ",
    hiddenWord: "tersembunyi",
    everyB: ", tidak pernah hadiahnya, bahkan pada opasitas 0%.",
    revealedNote: "Sekarang kamu bisa melihatnya. Serangan sungguhan menjaganya di 0%.",
    insightA:
      'Clickjacking sungguhan tidak bisa menyembunyikan prompt kamera atau lokasi milik browser, tapi bisa mencuri klik pada tombol di dalam halaman: sebuah suka, follow, "konfirmasi", "izinkan" dalam halaman. Situs bertahan dengan header ',
    insightB: " yang mencegah orang lain menyematkannya. Sebagai pengunjung: waspadai halaman yang memburu-burumu mengklik sesuatu yang mengilap.",
  },
};

/**
 * Clickjacking explainer. It does NOT trick the visitor into a real action.
 * It shows a decoy button with an invisible "malicious" layer on top, and an
 * opacity slider that reveals the hidden layer, so the visitor sees how a click
 * is stolen instead of having a click stolen from them.
 */
export function Clickjacking() {
  const t = useCopy(COPY);
  const [opacity, setOpacity] = useState(0);
  const [hits, setHits] = useState<("decoy" | "hidden")[]>([]);
  const revealed = opacity > 0.15;

  function onClick() {
    // In a real attack the top (hidden) layer always wins the click.
    setHits((h) => [...h, "hidden"]);
    if (hits.length === 0) track("whoami_action", { demo_action: "clickjacking", demo_result: "started" });
  }

  return (
    <section id="clickjacking" aria-labelledby="cj-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[09]</span>
      <h2 id="cj-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {t.title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">{t.lead}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
        <div className="select-none">
          {/* Only the button area is positioned, so the overlay covers the
              buttons and nothing else (an earlier version covered the slider). */}
          <div className="relative">
            {/* Decoy the victim thinks they are clicking */}
            <button
              type="button"
              onClick={onClick}
              className="w-full py-10 bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xl font-bold uppercase tracking-widest"
            >
              {t.prize}
            </button>

            {/* Hidden malicious layer, on top, intercepting the click */}
            <button
              type="button"
              onClick={onClick}
              aria-hidden="true"
              style={{ opacity }}
              className="absolute inset-0 flex items-center justify-center bg-red-600 text-white text-xl font-bold uppercase tracking-widest cursor-pointer"
            >
              {t.hidden}
            </button>
          </div>

          <div className="mt-6">
            <label htmlFor="cj-opacity" className="block font-mono text-[11px] uppercase tracking-widest text-white/50 mb-2">
              {t.reveal} {Math.round(opacity * 100)}%
            </label>
            <input
              id="cj-opacity"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>

        <div className="bg-[#121216] border border-white/5 p-6">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/50 mb-4">{t.hitsTitle}</h3>
          {hits.length === 0 ? (
            <p className="text-sm text-white/50">{t.hitsHint}</p>
          ) : (
            <>
              <div className="font-mono text-3xl text-red-400">{hits.length}×</div>
              <p className="mt-2 text-sm text-white/70">
                {t.everyA}
                <span className="text-red-400">{t.hiddenWord}</span>
                {t.everyB}
              </p>
            </>
          )}
          {revealed && <p className="mt-4 text-xs text-emerald-300/80">{t.revealedNote}</p>}
        </div>
      </div>

      <Insight>
        {t.insightA}
        <code className="text-white/70">X-Frame-Options</code> / <code className="text-white/70">frame-ancestors</code>
        {t.insightB}
      </Insight>
    </section>
  );
}
