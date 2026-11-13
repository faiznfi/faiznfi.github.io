import { useState } from "react";
import { Card, Insight, Section, Stat } from "../whoami/ui";
import { useCopy, useLang } from "../whoami/i18n";
import { NumberField, UseCases, fmtNum } from "./controls";
import { useSession, type Tool } from "./useSession";

/** Sections that can be recommended, with the "interest" each one signals. */
const CONTENT: Record<string, { topic: "marketing" | "product" | "analytics" | "governance"; next: string[] }> = {
  stream: { topic: "analytics", next: ["segments", "plan"] },
  segments: { topic: "marketing", next: ["retargeting", "lookalike"] },
  retargeting: { topic: "marketing", next: ["attribution", "lookalike"] },
  lookalike: { topic: "marketing", next: ["clv", "right"] },
  attribution: { topic: "analytics", next: ["funnel", "clv"] },
  funnel: { topic: "product", next: ["abtest", "beyond"] },
  abtest: { topic: "product", next: ["funnel", "plan"] },
  clv: { topic: "analytics", next: ["lookalike", "beyond"] },
  beyond: { topic: "product", next: ["right", "plan"] },
  right: { topic: "governance", next: ["plan", "stream"] },
  plan: { topic: "governance", next: ["right", "funnel"] },
};

const PERSONAL = {
  en: {
    title: "Personalisation: the next best thing to show",
    lead: "Recommendations (\"people who viewed this also bought…\"), a homepage that reorders itself, emails about what you actually browsed. All of it comes from behavioural events. Below is a tiny recommender running on your visit to this page.",
    recTitle: "Recommended for you, from this visit",
    interestTitle: "Your interests so far",
    because: "because you read",
    nothing: "Scroll through a couple of sections and recommendations will appear here.",
    notTried: "you read it but haven't tried the tool yet",
    allDone: "You've read every section and tried every tool. This is where a well-behaved site stops recommending and leaves you alone.",
    topics: { marketing: "Marketing", product: "Product & UX", analytics: "Analytics", governance: "Privacy & governance" },
    names: {
      stream: "Anonymous event stream", segments: "Segments", retargeting: "Retargeting", lookalike: "Lookalike audiences",
      attribution: "Attribution", funnel: "Funnels", abtest: "A/B testing", clv: "Customer lifetime value",
      beyond: "Beyond marketing", right: "Doing it right", plan: "Starter tracking plan",
    } as Record<string, string>,
    uses: [
      ["Product recommendations", "\"Frequently bought together\" and \"you may also like\" blocks are built from co-occurring view and purchase events across many anonymous sessions."],
      ["Personalised search ranking", "Results that others clicked and bought after the same query rise to the top."],
      ["Content and email", "Send the article, product or reminder that matches what someone engaged with, instead of the same blast to everyone."],
    ] as [string, string][],
    insight:
      "Personalisation is where tracking is most directly useful to the customer: less searching, more relevant suggestions. Keep it explainable (\"because you viewed…\") and don't infer sensitive traits such as health, religion or finances from behaviour.",
  },
  id: {
    title: "Personalisasi: hal terbaik berikutnya untuk ditampilkan",
    lead: "Rekomendasi (\"orang yang melihat ini juga membeli…\"), beranda yang menyusun ulang dirinya, email tentang apa yang benar-benar kamu lihat. Semuanya berasal dari event perilaku. Di bawah ini ada mesin rekomendasi kecil yang berjalan dari kunjunganmu ke halaman ini.",
    recTitle: "Rekomendasi untukmu, dari kunjungan ini",
    interestTitle: "Minatmu sejauh ini",
    because: "karena kamu membaca",
    nothing: "Scroll beberapa bagian dan rekomendasi akan muncul di sini.",
    notTried: "sudah kamu baca, tapi alatnya belum dicoba",
    allDone: "Kamu sudah membaca semua bagian dan mencoba semua alat. Di titik ini situs yang sopan berhenti merekomendasikan dan membiarkanmu.",
    topics: { marketing: "Marketing", product: "Produk & UX", analytics: "Analitik", governance: "Privasi & tata kelola" },
    names: {
      stream: "Aliran event anonim", segments: "Segmen", retargeting: "Retargeting", lookalike: "Lookalike audience",
      attribution: "Atribusi", funnel: "Funnel", abtest: "A/B testing", clv: "Customer lifetime value",
      beyond: "Di luar marketing", right: "Melakukannya dengan benar", plan: "Tracking plan awal",
    } as Record<string, string>,
    uses: [
      ["Rekomendasi produk", "Blok \"sering dibeli bersama\" dan \"mungkin kamu suka\" dibangun dari event lihat dan beli yang muncul bersamaan di banyak sesi anonim."],
      ["Peringkat pencarian personal", "Hasil yang diklik dan dibeli orang lain setelah kata kunci yang sama naik ke atas."],
      ["Konten dan email", "Kirim artikel, produk, atau pengingat yang sesuai dengan yang benar-benar dilihat seseorang, bukan blast yang sama untuk semua."],
    ] as [string, string][],
    insight:
      "Personalisasi adalah bentuk tracking yang paling langsung berguna bagi pelanggan: lebih sedikit mencari, saran lebih relevan. Buat tetap bisa dijelaskan (\"karena kamu melihat…\") dan jangan menyimpulkan hal sensitif seperti kesehatan, agama, atau keuangan dari perilaku.",
  },
};

/** Section id for each calculator, used when every section has been read. */
const TOOL_SECTIONS: [Tool, string][] = [
  ["retargeting", "retargeting"],
  ["attribution", "attribution"],
  ["funnel", "funnel"],
  ["ab_test", "abtest"],
  ["clv", "clv"],
  ["hashing", "right"],
];

export function Personalisation() {
  const t = useCopy(PERSONAL);
  const { sectionsViewed, toolsUsed } = useSession();
  const read = sectionsViewed.filter((id) => id in CONTENT && id !== "personal");

  // Score unread sections: +2 when a read section points to it, +1 per read section sharing its topic.
  const scores = new Map<string, { score: number; because: string }>();
  for (const id of read) {
    for (const next of CONTENT[id].next) {
      if (read.includes(next)) continue;
      const cur = scores.get(next) ?? { score: 0, because: id };
      scores.set(next, { score: cur.score + 2, because: cur.because });
    }
  }
  for (const [id, info] of Object.entries(CONTENT)) {
    if (read.includes(id)) continue;
    const same = read.filter((r) => CONTENT[r].topic === info.topic);
    if (same.length) {
      const cur = scores.get(id) ?? { score: 0, because: same[0] };
      scores.set(id, { score: cur.score + same.length, because: cur.because });
    }
  }
  let recs: [string, { because?: string }][] = [...scores.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, 3);
  // Everything read: recommend the calculators not yet tried instead.
  if (recs.length === 0 && read.length > 0) {
    recs = TOOL_SECTIONS.filter(([tool]) => !toolsUsed.includes(tool))
      .slice(0, 3)
      .map(([, id]) => [id, {}]);
  }
  const empty = recs.length === 0 ? (read.length > 0 ? t.allDone : t.nothing) : undefined;

  const topicCounts = Object.keys(t.topics).map((topic) => [topic, read.filter((r) => CONTENT[r].topic === topic).length] as const);
  const maxTopic = Math.max(1, ...topicCounts.map(([, n]) => n));

  return (
    <Section id="personal" index="08" title={t.title} lead={t.lead}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t.recTitle}>
          {empty ? (
            <p className="text-sm text-white/50">{empty}</p>
          ) : (
            <ol className="space-y-3">
              {recs.map(([id, { because }], i) => (
                <li key={id}>
                  <a href={`#${id}`} className="group flex gap-3">
                    <span className="font-mono text-cyan-500 text-sm">{i + 1}.</span>
                    <span>
                      <span className="block text-sm text-[#E0E0E6] group-hover:text-cyan-300">{t.names[id]}</span>
                      <span className="block text-xs text-white/40">
                        {because ? `${t.because} “${t.names[because]}”` : t.notTried}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card title={t.interestTitle}>
          <div className="space-y-3">
            {topicCounts.map(([topic, n]) => (
              <div key={topic}>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">{t.topics[topic as keyof typeof t.topics]}</span>
                  <span className="font-mono text-white/50">{n}</span>
                </div>
                <div className="mt-1 h-2 bg-white/5">
                  <div className="h-full bg-cyan-500/70 transition-[width] duration-300" style={{ width: `${(n / maxTopic) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6">
        <UseCases items={t.uses} />
      </div>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}

const CLV = {
  en: {
    title: "Customer lifetime value: how much a customer is really worth",
    lead: "When purchases are tracked against the same customer ID over time, you can see what a customer is worth across their whole relationship with you, not just their first order. That number tells you how much you can afford to spend to win one.",
    inputs: "Your numbers",
    aov: "Average order value",
    freq: "Orders per customer per year",
    margin: "Gross margin",
    years: "Average customer lifespan",
    yearsUnit: "years",
    cac: "Cost to acquire a customer (CAC)",
    results: "What it means",
    clv: "Lifetime value (profit)",
    ratio: "CLV : CAC",
    payback: "Months to earn back CAC",
    healthy: "Healthy. A common rule of thumb is a CLV:CAC of 3:1 or better; you have room to spend more on growth.",
    ok: "Profitable, but thin. Improve retention or margin before scaling ad spend.",
    bad: "Each new customer loses money. Lower acquisition cost, or raise repeat purchases, before spending more.",
    insight:
      "Without repeat-purchase tracking, a company judges every campaign on first-order revenue and underspends on its best channels. CLV also tells you which segments to retarget, which to seed lookalikes from, and when a customer's silence means they're about to churn.",
  },
  id: {
    title: "Customer lifetime value: berapa sebenarnya nilai seorang pelanggan",
    lead: "Ketika pembelian dilacak ke ID pelanggan yang sama dari waktu ke waktu, kamu bisa melihat nilai pelanggan sepanjang hubungannya denganmu, bukan hanya pesanan pertamanya. Angka itu memberi tahu berapa yang sanggup kamu keluarkan untuk mendapatkan satu pelanggan.",
    inputs: "Angkamu",
    aov: "Rata-rata nilai pesanan",
    freq: "Pesanan per pelanggan per tahun",
    margin: "Margin kotor",
    years: "Rata-rata lama menjadi pelanggan",
    yearsUnit: "tahun",
    cac: "Biaya mendapatkan pelanggan (CAC)",
    results: "Artinya",
    clv: "Lifetime value (laba)",
    ratio: "CLV : CAC",
    payback: "Bulan untuk balik modal CAC",
    healthy: "Sehat. Patokan umum CLV:CAC adalah 3:1 atau lebih; masih ada ruang untuk belanja lebih banyak demi pertumbuhan.",
    ok: "Untung, tapi tipis. Perbaiki retensi atau margin sebelum menambah anggaran iklan.",
    bad: "Setiap pelanggan baru justru merugi. Turunkan biaya akuisisi, atau tingkatkan pembelian ulang, sebelum menambah belanja.",
    insight:
      "Tanpa tracking pembelian ulang, perusahaan menilai setiap kampanye dari pendapatan pesanan pertama dan kurang berinvestasi di kanal terbaiknya. CLV juga memberi tahu segmen mana yang perlu di-retarget, dari mana seed lookalike diambil, dan kapan diamnya pelanggan berarti mereka akan churn.",
  },
};

export function Clv() {
  const t = useCopy(CLV);
  const { lang } = useLang();
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const { markTool } = useSession();
  const [aov, setAov] = useState(250_000);
  const [freq, setFreq] = useState(4);
  const [margin, setMargin] = useState(30);
  const [years, setYears] = useState(2);
  const [cac, setCac] = useState(120_000);

  const yearlyProfit = aov * freq * (margin / 100);
  const clv = yearlyProfit * years;
  const ratio = cac ? clv / cac : Infinity;
  const payback = yearlyProfit ? cac / (yearlyProfit / 12) : Infinity;
  const verdict = ratio >= 3 ? t.healthy : ratio >= 1 ? t.ok : t.bad;
  const tone = ratio >= 3 ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200" : ratio >= 1 ? "border-amber-500/30 bg-amber-500/5 text-amber-200" : "border-pink-500/40 bg-pink-500/5 text-pink-200";

  const field = (label: string, value: number, set: (v: number) => void, step: number, suffix?: string) => (
    <NumberField
      label={label}
      value={value}
      step={step}
      suffix={suffix}
      onChange={(v) => {
        set(v);
        markTool("clv");
      }}
    />
  );

  return (
    <Section id="clv" index="09" title={t.title} lead={t.lead}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t.inputs}>
          <div className="grid gap-3 sm:grid-cols-2">
            {field(t.aov, aov, setAov, 10000)}
            {field(t.freq, freq, setFreq, 0.5)}
            {field(t.margin, margin, setMargin, 1, "%")}
            {field(t.years, years, setYears, 0.5, t.yearsUnit)}
            <div className="sm:col-span-2">{field(t.cac, cac, setCac, 10000)}</div>
          </div>
        </Card>
        <Card title={t.results}>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t.clv} value={fmtNum(clv, locale)} />
            <Stat label={t.ratio} value={Number.isFinite(ratio) ? `${ratio.toFixed(1)} : 1` : "∞"} />
            <Stat label={t.payback} value={Number.isFinite(payback) ? payback.toFixed(1) : "–"} />
          </div>
          <div className={`mt-4 border p-4 text-sm leading-relaxed ${tone}`}>{verdict}</div>
        </Card>
      </div>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}
