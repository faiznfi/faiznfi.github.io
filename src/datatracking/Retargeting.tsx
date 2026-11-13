import { useState } from "react";
import { Card, Insight, Row, Rows, Section } from "../whoami/ui";
import { useCopy } from "../whoami/i18n";
import { Chip, UseCases } from "./controls";
import { useSession } from "./useSession";

type Stage = "view" | "cart" | "checkout" | "purchase";

const COPY = {
  en: {
    title: "Retargeting: finishing what the visitor started",
    lead: "Most visitors leave without buying. They didn't say no; they got distracted. Retargeting shows a follow-up ad to people who took a specific step, based on an event like add_to_cart, not on who they are. Pick where a visitor stopped to see the campaign a good team would run.",
    flow: ["Visitor takes a step", "Event sent (pixel or server)", "Added to an audience", "Ad platform matches the browser", "Follow-up ad", "Visitor returns"],
    pick: "Where did the visitor stop?",
    stages: { view: "Viewed a product", cart: "Added to cart", checkout: "Started checkout", purchase: "Purchased" } as Record<Stage, string>,
    planTitle: "Campaign plan",
    labels: { audience: "Audience rule", window: "Look-back window", message: "Message", offer: "Offer", frequency: "Frequency cap", exclude: "Exclude", channel: "Channels" },
    plans: {
      view: {
        audience: "view_item, and no add_to_cart",
        window: "7–14 days",
        message: "Show the exact product they viewed, plus similar items and reviews.",
        offer: "None yet; remind, don't discount.",
        frequency: "2–3 ads per day",
        exclude: "Anyone who added to cart or bought",
        channel: "Display, social feed, video",
      },
      cart: {
        audience: "add_to_cart, and no purchase",
        window: "1–7 days (intent fades fast)",
        message: "\"Your cart is waiting\" with the items, price and stock level.",
        offer: "Free shipping or a small voucher after 24 hours",
        frequency: "3–4 ads per day for the first 3 days",
        exclude: "Purchasers in the last 30 days",
        channel: "Social, email or push if they opted in",
      },
      checkout: {
        audience: "begin_checkout, and no purchase",
        window: "1–3 days",
        message: "Remove friction: payment options, delivery time, return policy.",
        offer: "Help, not a discount: chat link or COD option",
        frequency: "High for 48 hours, then stop",
        exclude: "Purchasers; people with a failed payment get a service message instead",
        channel: "Email, WhatsApp (opted-in), social",
      },
      purchase: {
        audience: "purchase",
        window: "Depends on the product's repurchase cycle",
        message: "Thank you, how-to content, then complementary products.",
        offer: "Loyalty points or a bundle, timed to the repurchase cycle",
        frequency: "Low: 1 per day at most",
        exclude: "Exclude from acquisition ads for the same product, so you stop paying to reach existing buyers",
        channel: "Email, app, social",
      },
    } as Record<Stage, Record<string, string>>,
    benefitsTitle: "Why it pays off",
    benefits: [
      ["Warm audience", "People who already showed interest convert far more often than cold audiences, so each ad shown works harder."],
      ["Less wasted spend", "Excluding buyers and quick bouncers stops you paying to reach people who will never act."],
      ["Right message, right moment", "Someone who abandoned checkout needs reassurance; someone who just browsed needs a reminder. Events tell you which."],
    ] as [string, string][],
    insight:
      "Retargeting only works on what is tracked: if add_to_cart isn't sent reliably, the most valuable audience is empty. It is also the most visible form of tracking to customers, so cap frequency, respect opt-outs and keep the look-back window short. Following someone for weeks turns a helpful reminder into the creepy ad people complain about.",
  },
  id: {
    title: "Retargeting: menuntaskan yang sudah dimulai pengunjung",
    lead: "Sebagian besar pengunjung pergi tanpa membeli. Mereka bukan menolak; mereka teralihkan. Retargeting menampilkan iklan lanjutan ke orang yang melakukan langkah tertentu, berdasarkan event seperti add_to_cart, bukan berdasarkan siapa mereka. Pilih di mana pengunjung berhenti untuk melihat kampanye yang akan dijalankan tim yang baik.",
    flow: ["Pengunjung melakukan langkah", "Event dikirim (pixel atau server)", "Masuk ke audiens", "Platform iklan mencocokkan browser", "Iklan lanjutan", "Pengunjung kembali"],
    pick: "Di mana pengunjung berhenti?",
    stages: { view: "Melihat produk", cart: "Menambah ke keranjang", checkout: "Mulai checkout", purchase: "Sudah membeli" } as Record<Stage, string>,
    planTitle: "Rencana kampanye",
    labels: { audience: "Aturan audiens", window: "Jendela waktu", message: "Pesan", offer: "Penawaran", frequency: "Batas frekuensi", exclude: "Kecualikan", channel: "Kanal" },
    plans: {
      view: {
        audience: "view_item, tanpa add_to_cart",
        window: "7–14 hari",
        message: "Tampilkan produk yang persis dilihat, plus produk serupa dan ulasan.",
        offer: "Belum ada; ingatkan, jangan beri diskon.",
        frequency: "2–3 iklan per hari",
        exclude: "Yang sudah menambah ke keranjang atau membeli",
        channel: "Display, feed media sosial, video",
      },
      cart: {
        audience: "add_to_cart, tanpa purchase",
        window: "1–7 hari (niat cepat memudar)",
        message: "\"Keranjangmu menunggu\" dengan barang, harga, dan sisa stok.",
        offer: "Gratis ongkir atau voucher kecil setelah 24 jam",
        frequency: "3–4 iklan per hari selama 3 hari pertama",
        exclude: "Pembeli dalam 30 hari terakhir",
        channel: "Media sosial, email atau push jika mereka setuju",
      },
      checkout: {
        audience: "begin_checkout, tanpa purchase",
        window: "1–3 hari",
        message: "Hilangkan hambatan: pilihan pembayaran, waktu kirim, kebijakan retur.",
        offer: "Bantuan, bukan diskon: tautan chat atau opsi COD",
        frequency: "Tinggi selama 48 jam, lalu berhenti",
        exclude: "Pembeli; yang pembayarannya gagal mendapat pesan layanan",
        channel: "Email, WhatsApp (yang setuju), media sosial",
      },
      purchase: {
        audience: "purchase",
        window: "Tergantung siklus beli ulang produk",
        message: "Terima kasih, konten cara pakai, lalu produk pelengkap.",
        offer: "Poin loyalitas atau bundling, sesuai siklus beli ulang",
        frequency: "Rendah: maksimal 1 per hari",
        exclude: "Keluarkan dari iklan akuisisi produk yang sama, supaya tidak membayar untuk menjangkau yang sudah membeli",
        channel: "Email, aplikasi, media sosial",
      },
    } as Record<Stage, Record<string, string>>,
    benefitsTitle: "Kenapa ini menguntungkan",
    benefits: [
      ["Audiens hangat", "Orang yang sudah menunjukkan minat jauh lebih sering membeli dibanding audiens dingin, jadi setiap iklan bekerja lebih keras."],
      ["Anggaran tidak terbuang", "Mengecualikan pembeli dan yang langsung keluar menghentikan biaya untuk menjangkau orang yang tidak akan bertindak."],
      ["Pesan tepat, waktu tepat", "Yang meninggalkan checkout butuh diyakinkan; yang hanya melihat-lihat butuh pengingat. Event memberi tahu yang mana."],
    ] as [string, string][],
    insight:
      "Retargeting hanya bekerja dari yang dilacak: kalau add_to_cart tidak terkirim dengan andal, audiens paling berharga jadi kosong. Ini juga bentuk tracking yang paling terlihat oleh pelanggan, jadi batasi frekuensi, hormati opt-out, dan pendekkan jendela waktunya. Mengikuti seseorang berminggu-minggu mengubah pengingat yang membantu menjadi iklan menyeramkan yang dikeluhkan orang.",
  },
};

export function Retargeting() {
  const t = useCopy(COPY);
  const { markTool, push } = useSession();
  const [stage, setStage] = useState<Stage>("cart");
  const plan = t.plans[stage];

  function pick(s: Stage) {
    setStage(s);
    markTool("retargeting");
    push("retargeting_stage", { stage: s });
  }

  return (
    <Section id="retargeting" index="03" title={t.title} lead={t.lead}>
      <ol className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/60">
        {t.flow.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="border border-white/10 bg-[#121216] px-2.5 py-1.5">{step}</span>
            {i < t.flow.length - 1 && <span aria-hidden="true" className="text-cyan-500">→</span>}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card title={t.pick}>
          <div className="flex flex-col gap-2">
            {(Object.keys(t.stages) as Stage[]).map((s, i) => (
              <Chip key={s} active={stage === s} onClick={() => pick(s)}>
                <span className="text-white/30 mr-2">{i + 1}.</span>
                {t.stages[s]}
              </Chip>
            ))}
          </div>
        </Card>
        <Card title={`${t.planTitle} · ${t.stages[stage]}`}>
          <Rows>
            {Object.entries(t.labels).map(([key, label]) => (
              <Row key={key} label={label} value={plan[key]} />
            ))}
          </Rows>
        </Card>
      </div>

      <div className="mt-6">
        <UseCases items={t.benefits} />
      </div>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}

const LOOKALIKE = {
  en: {
    title: "Lookalikes: finding more people like your best customers",
    lead: "Tracking also tells you who your best customers are by behaviour: they buy often, spend more, rarely return items. Upload that group as a seed, and ad platforms find new people who behave similarly. You reach strangers who are likely to care, instead of everyone.",
    items: [
      ["Seed with value, not volume", "A seed of your top 10% by lifetime value beats a seed of every buyer. The platform copies whatever you feed it."],
      ["Hash before you upload", "Customer lists are matched using hashed emails or phone numbers (SHA-256), never plain text. See section 11."],
      ["Refresh regularly", "Customers change. Rebuild seeds monthly from fresh purchase events so the lookalike doesn't chase last year's buyers."],
    ] as [string, string][],
    insight:
      "Lookalikes turn your first-party data into reach. The better your purchase and value events are tracked, the better the seed, and the cheaper each new customer becomes.",
  },
  id: {
    title: "Lookalike: mencari lebih banyak orang seperti pelanggan terbaikmu",
    lead: "Tracking juga memberi tahu siapa pelanggan terbaikmu dari perilakunya: sering membeli, belanja lebih banyak, jarang retur. Unggah kelompok itu sebagai seed, dan platform iklan mencari orang baru yang perilakunya mirip. Kamu menjangkau orang asing yang kemungkinan peduli, bukan semua orang.",
    items: [
      ["Seed berdasarkan nilai, bukan jumlah", "Seed dari 10% pelanggan teratas berdasarkan lifetime value mengalahkan seed dari semua pembeli. Platform meniru apa pun yang kamu berikan."],
      ["Hash sebelum mengunggah", "Daftar pelanggan dicocokkan memakai email atau nomor HP yang di-hash (SHA-256), tidak pernah teks biasa. Lihat bagian 11."],
      ["Perbarui secara rutin", "Pelanggan berubah. Bangun ulang seed tiap bulan dari event pembelian terbaru supaya lookalike tidak mengejar pembeli tahun lalu."],
    ] as [string, string][],
    insight:
      "Lookalike mengubah data first-party menjadi jangkauan. Semakin baik event pembelian dan nilai pelanggan dilacak, semakin baik seed-nya, dan semakin murah setiap pelanggan baru.",
  },
};

export function Lookalike() {
  const t = useCopy(LOOKALIKE);
  return (
    <Section id="lookalike" index="04" title={t.title} lead={t.lead}>
      <UseCases items={t.items} />
      <Insight>{t.insight}</Insight>
    </Section>
  );
}
