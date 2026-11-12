import { useRef, useState } from "react";
import { track } from "../lib/analytics";
import { Card, Insight, Stat } from "./ui";
import { useCopy } from "./i18n";

const COPY = {
  en: {
    cardTitle: "Type something. Don't press Enter.",
    srLabel: "Typing demo",
    placeholder: "e.g. your email, then delete it…",
    note: "There's no submit button. This text never leaves your browser.",
    keystrokes: "Keystrokes",
    avgGap: "Avg. gap between keys",
    typingSpeed: "Typing speed",
    wpmUnit: "wpm",
    seenTitle: "What a script on this page already saw",
    currentText: "Current text (before submit)",
    deletedText: "Text you deleted",
    pastedText: "Text you pasted",
    insight:
      "Forms don't need to be submitted to be read. Some marketing and session-replay scripts capture what you type as you type it, deleted text included, so an abandoned form still yields a lead. The rhythm of your typing (keystroke dynamics) is consistent enough to help tell people apart.",
  },
  id: {
    cardTitle: "Ketik sesuatu. Jangan tekan Enter.",
    srLabel: "Demo mengetik",
    placeholder: "mis. email kamu, lalu hapus…",
    note: "Tidak ada tombol kirim. Teks ini tidak pernah keluar dari browser kamu.",
    keystrokes: "Ketukan tombol",
    avgGap: "Rata-rata jeda antar tombol",
    typingSpeed: "Kecepatan mengetik",
    wpmUnit: "kpm",
    seenTitle: "Yang sudah dilihat skrip di halaman ini",
    currentText: "Teks saat ini (sebelum kirim)",
    deletedText: "Teks yang kamu hapus",
    pastedText: "Teks yang kamu tempel",
    insight:
      "Formulir tidak perlu dikirim untuk bisa dibaca. Beberapa skrip pemasaran dan session-replay menangkap apa yang kamu ketik saat kamu mengetiknya, termasuk teks yang dihapus, jadi formulir yang ditinggalkan pun tetap menghasilkan prospek. Ritme ketikanmu (keystroke dynamics) cukup konsisten untuk membantu membedakan orang.",
  },
};

/**
 * Shows that form fields can be read keystroke by keystroke before you submit,
 * including text you deleted, and how fast you type. Nothing leaves the page.
 */
export function TypingDemo() {
  const t = useCopy(COPY);
  const [value, setValue] = useState("");
  const [deleted, setDeleted] = useState("");
  const [pasted, setPasted] = useState<string>();
  const [stats, setStats] = useState({ keys: 0, avgIntervalMs: 0 });
  const lastKey = useRef<number | null>(null);
  const intervals = useRef<number[]>([]);
  const started = useRef(false);

  const onKeyDown = () => {
    const now = performance.now();
    if (lastKey.current !== null) {
      const gap = now - lastKey.current;
      if (gap < 2000) intervals.current.push(gap);
    }
    lastKey.current = now;
    const avg = intervals.current.length
      ? intervals.current.reduce((a, b) => a + b, 0) / intervals.current.length
      : 0;
    setStats((s) => ({ keys: s.keys + 1, avgIntervalMs: Math.round(avg) }));
    if (!started.current) {
      started.current = true;
      track("whoami_action", { demo_action: "typing_demo", demo_result: "started" });
    }
  };

  const onChange = (next: string) => {
    if (next.length < value.length && value.startsWith(next)) {
      setDeleted((d) => value.slice(next.length) + d);
    }
    setValue(next);
  };

  const wpm = stats.avgIntervalMs ? Math.round(60000 / stats.avgIntervalMs / 5) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={t.cardTitle}>
        <label htmlFor="typing-demo" className="sr-only">
          {t.srLabel}
        </label>
        <textarea
          id="typing-demo"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={(e) => setPasted(e.clipboardData.getData("text").slice(0, 120))}
          rows={4}
          placeholder={t.placeholder}
          className="w-full bg-[#0A0A0C] border border-white/10 p-3 font-mono text-sm text-[#E0E0E6] placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50"
        />
        <p className="mt-2 text-xs text-white/40">{t.note}</p>
      </Card>

      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-4">
          <Stat label={t.keystrokes} value={stats.keys} />
          <Stat label={t.avgGap} value={`${stats.avgIntervalMs} ms`} />
          <Stat label={t.typingSpeed} value={`${wpm} ${t.wpmUnit}`} />
        </div>
        <Card title={t.seenTitle}>
          <dl className="space-y-3 font-mono text-sm">
            <div>
              <dt className="text-white/40 text-xs">{t.currentText}</dt>
              <dd className="text-[#E0E0E6] break-words">{value || "—"}</dd>
            </div>
            <div>
              <dt className="text-white/40 text-xs">{t.deletedText}</dt>
              <dd className="text-pink-400 break-words">{deleted || "—"}</dd>
            </div>
            <div>
              <dt className="text-white/40 text-xs">{t.pastedText}</dt>
              <dd className="text-amber-300 break-words">{pasted ?? "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Insight>{t.insight}</Insight>
      </div>
    </div>
  );
}
