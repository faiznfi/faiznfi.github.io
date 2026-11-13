import { useState } from "react";
import { Card, Insight, Section } from "../whoami/ui";
import { useCopy, useLang } from "../whoami/i18n";
import { Bar, Chip, NumberField, fmtNum, fmtPct } from "./controls";
import { useSession } from "./useSession";

const CHANNELS = ["Instagram Ads", "Google Search", "Google Ads", "Email", "TikTok", "WhatsApp", "Direct", "Referral"] as const;
type Channel = (typeof CHANNELS)[number];
type Model = "last" | "first" | "linear" | "decay" | "position";
const MODELS: Model[] = ["last", "first", "linear", "decay", "position"];

/** Credit per touchpoint (sums to 1) for a journey of n touches. */
function weights(model: Model, n: number): number[] {
  if (n === 0) return [];
  if (n === 1) return [1];
  switch (model) {
    case "last":
      return Array.from({ length: n }, (_, i) => (i === n - 1 ? 1 : 0));
    case "first":
      return Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
    case "linear":
      return Array(n).fill(1 / n);
    case "decay": {
      const raw = Array.from({ length: n }, (_, i) => Math.pow(2, i - (n - 1)));
      const sum = raw.reduce((a, b) => a + b, 0);
      return raw.map((w) => w / sum);
    }
    case "position":
      if (n === 2) return [0.5, 0.5];
      return Array.from({ length: n }, (_, i) => (i === 0 || i === n - 1 ? 0.4 : 0.2 / (n - 2)));
  }
}

function creditByChannel(model: Model, journey: Channel[]) {
  const w = weights(model, journey.length);
  const out = new Map<Channel, number>();
  journey.forEach((ch, i) => out.set(ch, (out.get(ch) ?? 0) + w[i]));
  return out;
}

const COPY = {
  en: {
    title: "Attribution: which channel actually earned the sale?",
    lead: "Customers rarely buy on the first touch. They see an Instagram ad, google you a week later, open an email, then click a search ad and buy. Tracking each touch with the same anonymous ID lets you share the credit fairly. Build a journey and see how each model divides it.",
    build: "Build the journey (click to add, up to 6)",
    journey: "Journey",
    clear: "Clear",
    remove: "click a step to remove it",
    value: "Conversion value",
    modelTitle: "Credit by model",
    models: {
      last: ["Last click", "All credit to the final touch. The default in many tools, and it overrates search and direct."],
      first: ["First click", "All credit to the touch that introduced the customer. Overrates awareness channels."],
      linear: ["Linear", "Equal credit to every touch. Simple and fair, but treats a glance like a decision."],
      decay: ["Time decay", "Each earlier touch gets half the credit of the one after it. Rewards what happened close to the sale."],
      position: ["Position-based", "40% to the first touch, 40% to the last, 20% shared by the middle. Values both discovery and closing."],
    } as Record<Model, [string, string]>,
    tableChannel: "Channel",
    empty: "Add at least one touchpoint.",
    insight:
      "Under last click, the channel that introduced the customer can look worthless and get its budget cut, and then sales quietly drop a month later. Comparing models shows which channels open journeys and which close them. That only works if every touch, from ad click to purchase, carries the same anonymous ID and proper UTM tags.",
  },
  id: {
    title: "Atribusi: kanal mana yang sebenarnya menghasilkan penjualan?",
    lead: "Pelanggan jarang membeli di sentuhan pertama. Mereka melihat iklan Instagram, mencarimu di Google seminggu kemudian, membuka email, lalu klik iklan pencarian dan membeli. Melacak setiap sentuhan dengan ID anonim yang sama memungkinkan kredit dibagi dengan adil. Susun perjalanannya dan lihat cara tiap model membaginya.",
    build: "Susun perjalanan (klik untuk menambah, maksimal 6)",
    journey: "Perjalanan",
    clear: "Hapus semua",
    remove: "klik satu langkah untuk menghapusnya",
    value: "Nilai konversi",
    modelTitle: "Kredit per model",
    models: {
      last: ["Last click", "Semua kredit untuk sentuhan terakhir. Bawaan di banyak tools, dan terlalu menguntungkan search dan direct."],
      first: ["First click", "Semua kredit untuk sentuhan yang memperkenalkan pelanggan. Terlalu menguntungkan kanal awareness."],
      linear: ["Linear", "Kredit sama untuk setiap sentuhan. Sederhana dan adil, tapi menyamakan sekilas lihat dengan keputusan."],
      decay: ["Time decay", "Setiap sentuhan sebelumnya mendapat setengah kredit dari sentuhan sesudahnya. Menghargai yang terjadi dekat penjualan."],
      position: ["Position-based", "40% untuk sentuhan pertama, 40% untuk terakhir, 20% dibagi ke tengah. Menghargai penemuan dan penutupan."],
    } as Record<Model, [string, string]>,
    tableChannel: "Kanal",
    empty: "Tambahkan minimal satu sentuhan.",
    insight:
      "Dengan last click, kanal yang memperkenalkan pelanggan bisa terlihat tidak berguna lalu anggarannya dipotong, kemudian penjualan diam-diam turun sebulan setelahnya. Membandingkan model menunjukkan kanal mana yang membuka perjalanan dan mana yang menutupnya. Ini hanya bisa jika setiap sentuhan, dari klik iklan sampai pembelian, membawa ID anonim yang sama dan tag UTM yang benar.",
  },
};

export function Attribution() {
  const t = useCopy(COPY);
  const { lang } = useLang();
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const { markTool } = useSession();
  const [journey, setJourney] = useState<Channel[]>(["Instagram Ads", "Google Search", "Email", "Google Ads"]);
  const [value, setValue] = useState(1_000_000);
  const [model, setModel] = useState<Model>("last");

  function touch() {
    markTool("attribution");
  }

  const credits = Object.fromEntries(MODELS.map((m) => [m, creditByChannel(m, journey)])) as Record<Model, Map<Channel, number>>;
  const channels = [...new Set(journey)];

  return (
    <Section id="attribution" index="05" title={t.title} lead={t.lead}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t.build}>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((ch) => (
              <Chip
                key={ch}
                onClick={() => {
                  if (journey.length < 6) setJourney([...journey, ch]);
                  touch();
                }}
              >
                + {ch}
              </Chip>
            ))}
          </div>
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-white/50">
                {t.journey} <span className="text-white/30">({t.remove})</span>
              </span>
              <button type="button" onClick={() => setJourney([])} className="font-mono text-[11px] text-white/40 hover:text-pink-400">
                {t.clear}
              </button>
            </div>
            <ol className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
              {journey.length === 0 && <li className="text-white/30">{t.empty}</li>}
              {journey.map((ch, i) => (
                <li key={`${ch}-${i}`} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJourney(journey.filter((_, j) => j !== i));
                      touch();
                    }}
                    className="border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-cyan-300 hover:border-pink-500/50 hover:text-pink-300"
                  >
                    {i + 1}. {ch}
                  </button>
                  {i < journey.length - 1 && <span className="text-white/30">→</span>}
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-5 max-w-xs">
            <NumberField label={t.value} value={value} step={50000} onChange={(v) => { setValue(v); touch(); }} />
          </div>
        </Card>

        <Card title={t.modelTitle}>
          <div className="flex flex-wrap gap-2">
            {MODELS.map((m) => (
              <Chip key={m} active={model === m} onClick={() => { setModel(m); touch(); }}>
                {t.models[m][0]}
              </Chip>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/50 leading-relaxed">{t.models[model][1]}</p>
          <div className="mt-4 space-y-3">
            {channels.map((ch) => {
              const share = credits[model].get(ch) ?? 0;
              return <Bar key={ch} label={ch} share={share} value={`${fmtPct(share, locale, 0)} · ${fmtNum(share * value, locale)}`} />;
            })}
          </div>
        </Card>
      </div>

      {channels.length > 0 && (
        <div className="mt-4 overflow-x-auto bg-[#121216] border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left font-mono text-[11px] uppercase tracking-widest text-white/40">
                <th className="p-3 font-normal">{t.tableChannel}</th>
                {MODELS.map((m) => (
                  <th key={m} className={`p-3 font-normal text-right ${m === model ? "text-cyan-400" : ""}`}>
                    {t.models[m][0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr key={ch} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white/70">{ch}</td>
                  {MODELS.map((m) => (
                    <td key={m} className={`p-3 text-right font-mono tabular-nums ${m === model ? "text-cyan-300" : "text-white/60"}`}>
                      {fmtPct(credits[m].get(ch) ?? 0, locale, 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Insight>{t.insight}</Insight>
    </Section>
  );
}
