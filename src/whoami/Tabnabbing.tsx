import { useState } from "react";
import { track } from "../lib/analytics";
import { useTabnabbing } from "./useTabnabbing";
import { Card, Insight } from "./ui";
import { useCopy, useLang } from "./i18n";

const COPY = {
  en: {
    title: "This tab can change while you're not looking",
    lead: "A page keeps running after you switch away. It knows when you've left, and it can quietly rewrite its own tab title and icon to look like something you trust. Arm the demo, switch to another tab for two seconds, and look at this tab's title and favicon before you come back.",
    cardTitle: "Tabnabbing demo",
    arm: "Arm it, then switch tabs",
    fakeTitle: "⚠ Session expired — sign in again",
    caughtA: "Caught. While you were away, this tab renamed itself to ",
    caughtB: " and swapped its icon for a red alert. It changed back the instant you returned, at ",
    caught2: 'Now imagine returning to a tab you opened hours ago that now says "Session expired", with a login box. You\'d probably just sign in.',
    armed: "Armed. Switch to another tab now, wait ~2 seconds, and watch this tab's title and favicon. Then come back.",
    insight:
      "This is tabnabbing. The lesson: when you return to an old tab asking you to log in, don't trust it, open the site yourself from a fresh tab or a bookmark and check the real address bar. A page can fake its title and icon, but not your browser's own URL bar.",
  },
  id: {
    title: "Tab ini bisa berubah saat kamu tidak melihat",
    lead: "Sebuah halaman tetap berjalan setelah kamu beralih pergi. Ia tahu kapan kamu pergi, dan bisa diam-diam menulis ulang judul dan ikon tabnya sendiri agar terlihat seperti sesuatu yang kamu percaya. Aktifkan demo, pindah ke tab lain selama dua detik, dan lihat judul serta favicon tab ini sebelum kamu kembali.",
    cardTitle: "Demo tabnabbing",
    arm: "Aktifkan, lalu pindah tab",
    fakeTitle: "⚠ Sesi berakhir — masuk lagi",
    caughtA: "Ketahuan. Saat kamu pergi, tab ini mengganti namanya menjadi ",
    caughtB: " dan menukar ikonnya dengan peringatan merah. Ia berubah kembali seketika saat kamu kembali, pukul ",
    caught2: 'Sekarang bayangkan kembali ke tab yang kamu buka berjam-jam lalu yang kini bertuliskan "Sesi berakhir", dengan kotak login. Kamu mungkin langsung masuk saja.',
    armed: "Aktif. Pindah ke tab lain sekarang, tunggu ~2 detik, dan perhatikan judul serta favicon tab ini. Lalu kembali.",
    insight:
      "Ini namanya tabnabbing. Pelajarannya: saat kamu kembali ke tab lama yang memintamu login, jangan percaya, buka sendiri situsnya dari tab baru atau bookmark dan periksa address bar aslinya. Halaman bisa memalsukan judul dan ikonnya, tapi bukan URL bar milik browser kamu.",
  },
};

/**
 * UI for the tabnabbing demo. Arming it lets the tab rewrite its own title and
 * favicon while hidden, then reveals that it did so when the visitor returns.
 */
export function Tabnabbing() {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const [armed, setArmed] = useState(false);
  const { caughtAt } = useTabnabbing(armed, t.fakeTitle);

  function arm() {
    setArmed(true);
    track("whoami_action", { demo_action: "tabnabbing", demo_result: "started" });
  }

  return (
    <section id="tabnab" aria-labelledby="tabnab-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[12]</span>
      <h2 id="tabnab-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {t.title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">{t.lead}</p>

      <div className="mt-8">
        <Card title={t.cardTitle}>
          {!armed ? (
            <button type="button" onClick={arm} className="px-4 py-2 border border-cyan-500/40 text-cyan-400 text-xs font-mono uppercase tracking-widest hover:bg-cyan-500/10 transition-colors">
              {t.arm}
            </button>
          ) : caughtAt ? (
            <div>
              <p className="text-sm text-white/80">
                {t.caughtA}
                <span className="font-mono text-pink-400">"{t.fakeTitle}"</span>
                {t.caughtB}
                {caughtAt.toLocaleTimeString(lang === "id" ? "id-ID" : "en-GB")}.
              </p>
              <p className="mt-3 text-sm text-white/60">{t.caught2}</p>
            </div>
          ) : (
            <p className="text-sm text-cyan-300">{t.armed}</p>
          )}
        </Card>
      </div>

      <Insight>{t.insight}</Insight>
    </section>
  );
}
