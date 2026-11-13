import { useState } from "react";
import { Card, Insight, Section, Stat } from "../whoami/ui";
import { useCopy, useLang } from "../whoami/i18n";
import { Bar, Chip, NumberField, fmtNum, fmtPct } from "./controls";
import { useSession } from "./useSession";

const FUNNEL = {
  en: {
    title: "Funnels: finding where customers give up",
    lead: "Track each step of the path to purchase and you can see exactly where people drop off. Edit the numbers with your own data, then pick a step to improve and see what it's worth.",
    steps: ["Visited the site", "Viewed a product", "Added to cart", "Started checkout", "Purchased"],
    events: ["page_view", "view_item", "add_to_cart", "begin_checkout", "purchase"],
    inputTitle: "Visitors at each step (one week)",
    aov: "Average order value",
    chartTitle: "Where people drop off",
    ofPrev: "of previous step",
    worst: "biggest leak",
    overall: "Overall conversion",
    orders: "Orders",
    revenue: "Revenue",
    improveTitle: "What if we fix one step?",
    improveStep: "Step to improve",
    improveBy: "Improve its conversion by",
    pp: "percentage points",
    extraOrders: "Extra orders per week",
    extraRevenue: "Extra revenue per week",
    insight:
      "Without step-level events, all you know is \"conversion is 2.7%\". With them, you know checkout loses half the people who start it, which points at payment options or surprise shipping costs, and you can put a price on fixing it before anyone writes a line of code.",
  },
  id: {
    title: "Funnel: menemukan di mana pelanggan menyerah",
    lead: "Lacak setiap langkah menuju pembelian, dan kamu bisa melihat persis di mana orang berhenti. Ubah angkanya dengan datamu sendiri, lalu pilih langkah yang ingin diperbaiki dan lihat nilainya.",
    steps: ["Mengunjungi situs", "Melihat produk", "Menambah ke keranjang", "Mulai checkout", "Membeli"],
    events: ["page_view", "view_item", "add_to_cart", "begin_checkout", "purchase"],
    inputTitle: "Pengunjung di tiap langkah (satu minggu)",
    aov: "Rata-rata nilai pesanan",
    chartTitle: "Di mana orang berhenti",
    ofPrev: "dari langkah sebelumnya",
    worst: "kebocoran terbesar",
    overall: "Konversi keseluruhan",
    orders: "Pesanan",
    revenue: "Pendapatan",
    improveTitle: "Bagaimana kalau satu langkah diperbaiki?",
    improveStep: "Langkah yang diperbaiki",
    improveBy: "Naikkan konversinya sebesar",
    pp: "poin persentase",
    extraOrders: "Tambahan pesanan per minggu",
    extraRevenue: "Tambahan pendapatan per minggu",
    insight:
      "Tanpa event per langkah, yang kamu tahu hanya \"konversinya 2,7%\". Dengannya, kamu tahu checkout kehilangan separuh orang yang memulainya, yang mengarah ke pilihan pembayaran atau ongkir yang mengejutkan, dan kamu bisa menghitung nilai perbaikannya sebelum ada yang menulis satu baris kode.",
  },
};

export function Funnel() {
  const t = useCopy(FUNNEL);
  const { lang } = useLang();
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const { markTool } = useSession();
  const [counts, setCounts] = useState([10000, 4200, 900, 520, 270]);
  const [aov, setAov] = useState(250_000);
  const [pp, setPp] = useState(5);

  const stepRates = counts.map((c, i) => (i === 0 ? 1 : counts[i - 1] ? c / counts[i - 1] : 0));
  const worst = stepRates.slice(1).reduce((w, r, i) => (r < stepRates[w] ? i + 1 : w), 1);
  const [improve, setImprove] = useState<number | null>(null);
  const target = improve ?? worst;

  const newRates = stepRates.map((r, i) => (i === target ? Math.min(1, r + pp / 100) : r));
  const purchases = counts[counts.length - 1];
  const newPurchases = newRates.slice(1).reduce((n, r) => n * r, counts[0]);
  const extra = Math.max(0, newPurchases - purchases);

  function touch() {
    markTool("funnel");
  }

  return (
    <Section id="funnel" index="06" title={t.title} lead={t.lead}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card title={t.inputTitle}>
          <div className="space-y-3">
            {t.steps.map((step, i) => (
              <NumberField
                key={step}
                label={`${step} · ${t.events[i]}`}
                value={counts[i]}
                step={10}
                onChange={(v) => {
                  setCounts(counts.map((c, j) => (j === i ? v : c)));
                  touch();
                }}
              />
            ))}
            <NumberField label={t.aov} value={aov} step={10000} onChange={(v) => { setAov(v); touch(); }} />
          </div>
        </Card>
        <Card title={t.chartTitle}>
          <div className="space-y-4">
            {t.steps.map((step, i) => (
              <div key={step}>
                <Bar
                  label={step}
                  share={counts[0] ? counts[i] / counts[0] : 0}
                  value={fmtNum(counts[i], locale)}
                  tone={i === worst ? "pink" : "cyan"}
                />
                {i > 0 && (
                  <div className={`mt-1 font-mono text-[11px] ${i === worst ? "text-pink-400" : "text-white/40"}`}>
                    {fmtPct(stepRates[i], locale)} {t.ofPrev}
                    {i === worst && ` · ${t.worst}`}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label={t.overall} value={fmtPct(counts[0] ? purchases / counts[0] : 0, locale, 2)} />
            <Stat label={t.orders} value={fmtNum(purchases, locale)} />
            <Stat label={t.revenue} value={fmtNum(purchases * aov, locale)} />
          </div>
        </Card>
      </div>

      <Card title={t.improveTitle} className="mt-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <span className="text-xs text-white/50">{t.improveStep}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.steps.slice(1).map((step, k) => (
                <Chip key={step} active={target === k + 1} onClick={() => { setImprove(k + 1); touch(); }}>
                  {step}
                </Chip>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="text-xs text-white/50">
                {t.improveBy} <span className="font-mono text-cyan-400">+{pp}</span> {t.pp}
              </span>
              <input
                type="range"
                min={1}
                max={20}
                value={pp}
                onChange={(e) => { setPp(Number(e.target.value)); touch(); }}
                className="mt-2 w-full accent-cyan-500"
              />
            </label>
            <p className="mt-2 font-mono text-xs text-white/50">
              {fmtPct(stepRates[target], locale)} → <span className="text-emerald-400">{fmtPct(newRates[target], locale)}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 content-start">
            <Stat label={t.extraOrders} value={`+${fmtNum(extra, locale)}`} />
            <Stat label={t.extraRevenue} value={`+${fmtNum(extra * aov, locale)}`} />
          </div>
        </div>
      </Card>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}

/** Standard normal CDF via the Abramowitz–Stegun erf approximation (error < 1.5e-7). */
function normCdf(z: number) {
  const x = Math.abs(z) / Math.SQRT2;
  const k = 1 / (1 + 0.3275911 * x);
  const erf = 1 - ((((1.061405429 * k - 1.453152027) * k + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-x * x);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

const AB = {
  en: {
    title: "A/B testing: let the data settle the argument",
    lead: "Should the button say \"Buy now\" or \"Add to cart\"? Instead of debating, show each version to a random half of visitors and compare conversions. Tracking makes it possible; statistics tells you whether the difference is real or luck. Try your own numbers.",
    a: "Version A (control)",
    b: "Version B (new)",
    visitors: "Visitors",
    conversions: "Conversions",
    resultTitle: "Result",
    rateA: "Conversion A",
    rateB: "Conversion B",
    uplift: "Relative uplift",
    pValue: "p-value",
    winB: "B wins. The difference is statistically significant at 95% confidence. Ship B.",
    loseB: "B is worse, and that's significant at 95% confidence. Keep A; you just avoided a bad launch.",
    notYet: "Not significant yet. The difference could still be chance.",
    need: "To reliably detect a difference this size (95% confidence, 80% power), you need about",
    perVariant: "visitors per version.",
    same: "The two versions convert at the same rate; there is nothing to detect.",
    insight:
      "Most teams that A/B test learn that many of their \"obvious\" improvements do nothing, and a few surprise them. That knowledge compounds: a team that ships only what tests prove ends up with a product that converts measurably better every quarter. Decide the sample size before you start, and don't stop the test the moment it looks good.",
  },
  id: {
    title: "A/B testing: biarkan data yang menyelesaikan perdebatan",
    lead: "Tombolnya sebaiknya \"Beli sekarang\" atau \"Tambah ke keranjang\"? Daripada berdebat, tampilkan tiap versi ke separuh pengunjung secara acak dan bandingkan konversinya. Tracking membuatnya mungkin; statistik memberi tahu apakah perbedaannya nyata atau kebetulan. Coba angkamu sendiri.",
    a: "Versi A (kontrol)",
    b: "Versi B (baru)",
    visitors: "Pengunjung",
    conversions: "Konversi",
    resultTitle: "Hasil",
    rateA: "Konversi A",
    rateB: "Konversi B",
    uplift: "Kenaikan relatif",
    pValue: "p-value",
    winB: "B menang. Perbedaannya signifikan secara statistik pada tingkat kepercayaan 95%. Rilis B.",
    loseB: "B lebih buruk, dan itu signifikan pada tingkat kepercayaan 95%. Pertahankan A; kamu baru saja terhindar dari rilis yang buruk.",
    notYet: "Belum signifikan. Perbedaannya masih bisa karena kebetulan.",
    need: "Untuk mendeteksi perbedaan sebesar ini dengan andal (kepercayaan 95%, power 80%), kamu butuh sekitar",
    perVariant: "pengunjung per versi.",
    same: "Kedua versi punya tingkat konversi yang sama; tidak ada yang perlu dideteksi.",
    insight:
      "Sebagian besar tim yang menjalankan A/B test belajar bahwa banyak perbaikan yang \"jelas\" ternyata tidak berpengaruh, dan beberapa justru mengejutkan. Pengetahuan itu bertumpuk: tim yang hanya merilis apa yang terbukti lewat tes akan punya produk yang konversinya terukur lebih baik setiap kuartal. Tentukan ukuran sampel sebelum mulai, dan jangan hentikan tes begitu hasilnya terlihat bagus.",
  },
};

export function AbTest() {
  const t = useCopy(AB);
  const { lang } = useLang();
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const { markTool } = useSession();
  const [nA, setNA] = useState(5000);
  const [cA, setCA] = useState(150);
  const [nB, setNB] = useState(5000);
  const [cB, setCB] = useState(185);

  function touch() {
    markTool("ab_test");
  }

  const pA = nA ? Math.min(cA, nA) / nA : 0;
  const pB = nB ? Math.min(cB, nB) / nB : 0;
  const pooled = nA + nB ? (Math.min(cA, nA) + Math.min(cB, nB)) / (nA + nB) : 0;
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / (nA || 1) + 1 / (nB || 1)));
  const z = se ? (pB - pA) / se : 0;
  const p = se ? 2 * (1 - normCdf(Math.abs(z))) : 1;
  const significant = p < 0.05;
  const uplift = pA ? (pB - pA) / pA : NaN;

  const pBar = (pA + pB) / 2;
  const needed =
    pA !== pB
      ? Math.ceil(Math.pow(1.959964 * Math.sqrt(2 * pBar * (1 - pBar)) + 0.841621 * Math.sqrt(pA * (1 - pA) + pB * (1 - pB)), 2) / Math.pow(pB - pA, 2))
      : Infinity;

  const verdict = significant ? (pB > pA ? t.winB : t.loseB) : t.notYet;
  const tone = significant ? (pB > pA ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200" : "border-pink-500/40 bg-pink-500/5 text-pink-200") : "border-amber-500/30 bg-amber-500/5 text-amber-200";

  const field = (label: string, value: number, set: (v: number) => void) => (
    <NumberField label={label} value={value} step={10} onChange={(v) => { set(v); touch(); }} />
  );

  return (
    <Section id="abtest" index="07" title={t.title} lead={t.lead}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={t.a}>
          <div className="space-y-3">
            {field(t.visitors, nA, setNA)}
            {field(t.conversions, cA, setCA)}
          </div>
        </Card>
        <Card title={t.b}>
          <div className="space-y-3">
            {field(t.visitors, nB, setNB)}
            {field(t.conversions, cB, setCB)}
          </div>
        </Card>
        <Card title={t.resultTitle}>
          <div className="grid grid-cols-2 gap-3">
            <Stat label={t.rateA} value={fmtPct(pA, locale, 2)} />
            <Stat label={t.rateB} value={fmtPct(pB, locale, 2)} />
            <Stat label={t.uplift} value={Number.isFinite(uplift) ? `${uplift >= 0 ? "+" : ""}${fmtPct(uplift, locale)}` : "–"} />
            <Stat label={t.pValue} value={p < 0.0001 ? "<0.0001" : p.toFixed(4)} />
          </div>
        </Card>
      </div>
      <div className={`mt-4 border p-4 text-sm leading-relaxed ${tone}`}>
        {verdict}
        {!significant && (
          <span className="block mt-1 text-white/60">
            {Number.isFinite(needed) ? `${t.need} ${fmtNum(needed, locale)} ${t.perVariant}` : t.same}
          </span>
        )}
      </div>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}
