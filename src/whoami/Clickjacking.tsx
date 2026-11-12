import { useState } from "react";
import { track } from "../lib/analytics";
import { Insight } from "./ui";

/**
 * Clickjacking explainer. It does NOT trick the visitor into a real action.
 * It shows a decoy button with an invisible "malicious" layer on top, and an
 * opacity slider that reveals the hidden layer, so the visitor sees how a click
 * is stolen instead of having a click stolen from them.
 */
export function Clickjacking() {
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
        The button you see isn't the button you click
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">
        Clickjacking stacks an invisible layer over a friendly-looking button. You aim for "Claim your prize"; your click
        lands on something hidden, like "Allow" or "Confirm payment". Below, nothing real happens, and the slider lets you
        fade the hidden layer in so you can see the trick.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
        <div className="relative select-none">
          {/* Decoy the victim thinks they are clicking */}
          <button
            type="button"
            onClick={onClick}
            className="w-full py-10 bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xl font-bold uppercase tracking-widest"
          >
            🎁 Claim your free prize
          </button>

          {/* Hidden malicious layer, on top, intercepting the click */}
          <button
            type="button"
            onClick={onClick}
            aria-hidden="true"
            style={{ opacity }}
            className="absolute inset-0 flex items-center justify-center bg-red-600 text-white text-xl font-bold uppercase tracking-widest cursor-pointer"
          >
            ⚠ Allow this site to post as you
          </button>

          <div className="mt-6">
            <label htmlFor="cj-opacity" className="block font-mono text-[11px] uppercase tracking-widest text-white/50 mb-2">
              Reveal the hidden layer: {Math.round(opacity * 100)}%
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
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/50 mb-4">What your clicks actually hit</h3>
          {hits.length === 0 ? (
            <p className="text-sm text-white/50">Click the prize button a few times.</p>
          ) : (
            <>
              <div className="font-mono text-3xl text-red-400">{hits.length}×</div>
              <p className="mt-2 text-sm text-white/70">
                Every click hit the <span className="text-red-400">hidden</span> button, never the prize, even at 0%
                opacity.
              </p>
            </>
          )}
          {revealed && <p className="mt-4 text-xs text-emerald-300/80">Now you can see it. A real attack keeps it at 0%.</p>}
        </div>
      </div>

      <Insight>
        Real clickjacking can't hide the browser's own camera or location prompt, but it can steal clicks on buttons
        inside a page: a like, a follow, a "confirm", an in-page "allow". Sites defend with an{" "}
        <code className="text-white/70">X-Frame-Options</code> / <code className="text-white/70">frame-ancestors</code>{" "}
        header that stops others embedding them. As a visitor: be wary of pages that rush you to click something shiny.
      </Insight>
    </section>
  );
}
