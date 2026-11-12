import { useState } from "react";
import { track } from "../lib/analytics";
import { useTabnabbing } from "./useTabnabbing";
import { Card, Insight } from "./ui";

/**
 * UI for the tabnabbing demo. Arming it lets the tab rewrite its own title and
 * favicon while hidden, then reveals that it did so when the visitor returns.
 */
export function Tabnabbing() {
  const [armed, setArmed] = useState(false);
  const { caughtAt, fakeTitle } = useTabnabbing(armed);

  function arm() {
    setArmed(true);
    track("whoami_action", { demo_action: "tabnabbing", demo_result: "started" });
  }

  return (
    <section id="tabnab" aria-labelledby="tabnab-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[12]</span>
      <h2 id="tabnab-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        This tab can change while you're not looking
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">
        A page keeps running after you switch away. It knows when you've left, and it can quietly rewrite its own tab
        title and icon to look like something you trust. Arm the demo, switch to another tab for two seconds, and look at
        this tab's title and favicon before you come back.
      </p>

      <div className="mt-8">
        <Card title="Tabnabbing demo">
          {!armed ? (
            <button type="button" onClick={arm} className="px-4 py-2 border border-cyan-500/40 text-cyan-400 text-xs font-mono uppercase tracking-widest hover:bg-cyan-500/10 transition-colors">
              Arm it, then switch tabs
            </button>
          ) : caughtAt ? (
            <div>
              <p className="text-sm text-white/80">
                Caught. While you were away, this tab renamed itself to{" "}
                <span className="font-mono text-pink-400">"{fakeTitle}"</span> and swapped its icon for a red alert. It
                changed back the instant you returned, at {caughtAt.toLocaleTimeString("en-GB")}.
              </p>
              <p className="mt-3 text-sm text-white/60">
                Now imagine returning to a tab you opened hours ago that now says "Session expired", with a login box.
                You'd probably just sign in.
              </p>
            </div>
          ) : (
            <p className="text-sm text-cyan-300">
              Armed. Switch to another tab now, wait ~2 seconds, and watch this tab's title and favicon. Then come back.
            </p>
          )}
        </Card>
      </div>

      <Insight>
        This is tabnabbing. The lesson: when you return to an old tab asking you to log in, don't trust it, open the site
        yourself from a fresh tab or a bookmark and check the real address bar. A page can fake its title and icon, but
        not your browser's own URL bar.
      </Insight>
    </section>
  );
}
