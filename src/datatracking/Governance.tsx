import { useEffect, useState } from "react";
import { Card, Insight, Section } from "../whoami/ui";
import { useCopy } from "../whoami/i18n";
import { UseCases } from "./controls";
import { useSession } from "./useSession";

const BEYOND = {
  en: {
    title: "Beyond marketing: the rest of the company benefits too",
    lead: "The same anonymous event stream that powers ads also answers questions for product, operations, finance and customer service.",
    items: [
      ["Churn prediction", "A customer who used to order every two weeks and has gone quiet for six is a churn risk. Spot it from event gaps and win them back before they're gone."],
      ["Fraud detection", "Bots and fraudsters behave differently: impossible speed, many accounts from one device class, checkout without browsing. Event patterns flag them in real time."],
      ["Demand forecasting", "Product views and add-to-carts rise before sales do. Feeding them into forecasts helps stock the right items in the right warehouse."],
      ["Product & UX", "Rage clicks, dead ends, form fields people abandon, features nobody finds. Behaviour shows what to fix next better than any survey."],
      ["Pricing & promotions", "Measure whether a discount created new demand or just gave money to people who would have bought anyway."],
      ["Customer service", "When a customer asks for help, the agent can see which step failed (payment error, out-of-stock) instead of asking them to explain."],
      ["Site performance", "Joining page speed (Core Web Vitals) with conversion shows how much revenue each second of loading costs, which gets performance work prioritised."],
      ["Marketing mix modelling", "Aggregate, privacy-safe data (spend and sales per week per channel) estimates each channel's impact without tracking any individual."],
      ["Content strategy", "Which articles bring visitors who later buy? Write more of those, not just more of whatever gets clicks."],
    ] as [string, string][],
    insight:
      "Tracking is often owned by marketing, but its biggest wins frequently come from elsewhere. Design the event schema once, well, and every team can use it.",
  },
  id: {
    title: "Di luar marketing: seluruh perusahaan ikut diuntungkan",
    lead: "Aliran event anonim yang sama yang menggerakkan iklan juga menjawab pertanyaan tim produk, operasional, keuangan, dan layanan pelanggan.",
    items: [
      ["Prediksi churn", "Pelanggan yang biasanya pesan tiap dua minggu lalu diam enam minggu berisiko churn. Kenali dari jeda event dan ajak kembali sebelum mereka benar-benar pergi."],
      ["Deteksi fraud", "Bot dan penipu berperilaku berbeda: kecepatan tidak masuk akal, banyak akun dari satu jenis perangkat, checkout tanpa melihat-lihat. Pola event menandainya secara real time."],
      ["Peramalan permintaan", "Jumlah lihat produk dan tambah ke keranjang naik sebelum penjualan naik. Memasukkannya ke peramalan membantu menyetok barang yang tepat di gudang yang tepat."],
      ["Produk & UX", "Rage click, jalan buntu, kolom formulir yang ditinggalkan, fitur yang tidak ditemukan siapa pun. Perilaku menunjukkan apa yang perlu diperbaiki lebih baik dari survei mana pun."],
      ["Harga & promosi", "Ukur apakah diskon menciptakan permintaan baru atau hanya memberi uang ke orang yang toh akan membeli."],
      ["Layanan pelanggan", "Saat pelanggan minta bantuan, agen bisa melihat langkah mana yang gagal (error pembayaran, stok habis) tanpa meminta mereka menjelaskan."],
      ["Performa situs", "Menggabungkan kecepatan halaman (Core Web Vitals) dengan konversi menunjukkan berapa pendapatan yang hilang tiap detik loading, sehingga perbaikan performa jadi prioritas."],
      ["Marketing mix modelling", "Data agregat yang aman privasi (belanja iklan dan penjualan per minggu per kanal) memperkirakan dampak tiap kanal tanpa melacak individu."],
      ["Strategi konten", "Artikel mana yang mendatangkan pengunjung yang kemudian membeli? Tulis lebih banyak yang seperti itu, bukan sekadar yang paling banyak diklik."],
    ] as [string, string][],
    insight:
      "Tracking sering dimiliki tim marketing, padahal kemenangan terbesarnya sering datang dari tempat lain. Rancang skema event sekali, dengan baik, dan semua tim bisa memakainya.",
  },
};

export function Beyond() {
  const t = useCopy(BEYOND);
  return (
    <Section id="beyond" index="10" title={t.title} lead={t.lead}>
      <UseCases items={t.items} />
      <Insight>{t.insight}</Insight>
    </Section>
  );
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const RIGHT = {
  en: {
    title: "Doing it right: anonymous, consented, minimal",
    lead: "Everything above only stays an asset if it's collected properly. Done badly, the same data becomes a breach, a fine and a headline. In Indonesia, the Personal Data Protection Law (UU PDP, No. 27 of 2022) has applied in full since October 2024, with administrative fines of up to 2% of annual revenue.",
    levelsTitle: "Three levels of \"who\"",
    levels: [
      ["Personal data", "Name, email, phone, precise location, ID number.", "Needs a lawful basis such as consent. Keep it out of analytics tools entirely.", "pink"],
      ["Pseudonymous", "Random cookie ID, internal user ID, hashed email.", "Still personal data under UU PDP and GDPR, because it can be linked back. Needs consent and protection.", "amber"],
      ["Anonymous / aggregate", "\"312 people added to cart on Tuesday\". Counts with small groups suppressed.", "Not personal data once nobody can be singled out. Safe to share and keep.", "emerald"],
    ] as [string, string, string, string][],
    hashTitle: "Hashing: how customer lists are matched without sharing emails",
    hashLead: "Ad platforms match customers using a SHA-256 hash of a normalised email (trimmed, lower-case). Type one; it never leaves your browser.",
    hashPlaceholder: "name@example.com",
    normalised: "Normalised",
    hash: "SHA-256",
    hashNote:
      "The same email always gives the same hash, which is exactly why matching works, and why a hash is pseudonymous, not anonymous. Anyone with a list of emails can hash them and compare. Treat hashed identifiers with the same care as the originals.",
    principlesTitle: "The checklist",
    principles: [
      ["Ask first", "Use a consent banner that actually blocks tags until people agree, and pass the choice on to your tags (for example Google Consent Mode)."],
      ["Events, not identities", "Send what happened (add_to_cart, value, item) with a random ID. Never put names, emails or phone numbers in event parameters or URLs."],
      ["Collect only what you'll use", "Every field in the tracking plan needs an owner and a use case. If nobody can name the decision it supports, don't collect it."],
      ["First-party and server-side", "Collect on your own domain and forward events from your server. You control what each vendor receives and can strip identifiers before it leaves."],
      ["Short retention", "Keep raw event-level data for months, not forever. Aggregate what you need for long-term trends and delete the rest."],
      ["Aggregate before sharing", "Reports outside the analytics team show groups, with small groups (say, under 10 people) suppressed."],
      ["Restrict access", "Raw data is for the few people who need it, with access logged. Dashboards are for everyone else."],
      ["Honour requests", "Make it possible to find and delete one person's data when they ask. That's a legal right under UU PDP."],
    ] as [string, string][],
    insight:
      "Privacy and good analytics aren't opposites. The disciplined version (consent, minimal events, random IDs, aggregation) is also cleaner, cheaper to store and easier to trust, so the numbers get used. Compare with what the whoami page shows: the difference between tracking and surveillance is mostly choices like these.",
  },
  id: {
    title: "Melakukannya dengan benar: anonim, dengan persetujuan, seperlunya",
    lead: "Semua di atas hanya tetap menjadi aset jika dikumpulkan dengan benar. Kalau dilakukan dengan buruk, data yang sama menjadi kebocoran, denda, dan berita utama. Di Indonesia, UU Pelindungan Data Pribadi (UU PDP, No. 27 Tahun 2022) berlaku penuh sejak Oktober 2024, dengan sanksi administratif berupa denda hingga 2% dari pendapatan tahunan.",
    levelsTitle: "Tiga tingkat \"siapa\"",
    levels: [
      ["Data pribadi", "Nama, email, nomor HP, lokasi persis, NIK.", "Butuh dasar hukum seperti persetujuan. Jauhkan sepenuhnya dari tools analitik.", "pink"],
      ["Pseudonim", "ID cookie acak, ID pengguna internal, email yang di-hash.", "Tetap data pribadi menurut UU PDP dan GDPR, karena bisa dihubungkan kembali. Butuh persetujuan dan perlindungan.", "amber"],
      ["Anonim / agregat", "\"312 orang menambah ke keranjang hari Selasa\". Hitungan dengan kelompok kecil disembunyikan.", "Bukan data pribadi selama tidak ada yang bisa dikenali satu per satu. Aman dibagikan dan disimpan.", "emerald"],
    ] as [string, string, string, string][],
    hashTitle: "Hashing: cara daftar pelanggan dicocokkan tanpa membagikan email",
    hashLead: "Platform iklan mencocokkan pelanggan memakai hash SHA-256 dari email yang dinormalisasi (dipangkas, huruf kecil). Ketik satu; tidak pernah keluar dari browsermu.",
    hashPlaceholder: "nama@contoh.com",
    normalised: "Dinormalisasi",
    hash: "SHA-256",
    hashNote:
      "Email yang sama selalu menghasilkan hash yang sama, itulah kenapa pencocokan bisa berjalan, dan kenapa hash bersifat pseudonim, bukan anonim. Siapa pun yang punya daftar email bisa meng-hash-nya lalu membandingkan. Perlakukan identitas yang di-hash sama hati-hatinya dengan aslinya.",
    principlesTitle: "Daftar periksa",
    principles: [
      ["Minta izin dulu", "Pakai banner persetujuan yang benar-benar memblokir tag sampai orang setuju, dan teruskan pilihannya ke tag (misalnya Google Consent Mode)."],
      ["Event, bukan identitas", "Kirim apa yang terjadi (add_to_cart, nilai, barang) dengan ID acak. Jangan pernah menaruh nama, email, atau nomor HP di parameter event atau URL."],
      ["Kumpulkan hanya yang dipakai", "Setiap field di tracking plan butuh pemilik dan kegunaan. Kalau tidak ada yang bisa menyebut keputusan yang didukungnya, jangan kumpulkan."],
      ["First-party dan server-side", "Kumpulkan di domain sendiri dan teruskan event dari servermu. Kamu mengontrol apa yang diterima tiap vendor dan bisa membuang identitas sebelum dikirim."],
      ["Retensi pendek", "Simpan data mentah per event dalam hitungan bulan, bukan selamanya. Agregasikan yang dibutuhkan untuk tren jangka panjang dan hapus sisanya."],
      ["Agregasi sebelum dibagikan", "Laporan di luar tim analitik menampilkan kelompok, dengan kelompok kecil (misalnya di bawah 10 orang) disembunyikan."],
      ["Batasi akses", "Data mentah untuk sedikit orang yang membutuhkannya, dengan akses tercatat. Dashboard untuk yang lain."],
      ["Penuhi permintaan", "Pastikan data satu orang bisa ditemukan dan dihapus saat mereka meminta. Itu hak yang dijamin UU PDP."],
    ] as [string, string][],
    insight:
      "Privasi dan analitik yang baik bukan dua hal yang berlawanan. Versi yang disiplin (persetujuan, event seperlunya, ID acak, agregasi) juga lebih bersih, lebih murah disimpan, dan lebih mudah dipercaya, sehingga angkanya benar-benar dipakai. Bandingkan dengan halaman whoami: perbedaan antara tracking dan pengintaian sebagian besar ada pada pilihan-pilihan seperti ini.",
  },
};

const LEVEL_TONE: Record<string, string> = {
  pink: "border-pink-500/40 text-pink-400",
  amber: "border-amber-500/40 text-amber-300",
  emerald: "border-emerald-500/40 text-emerald-400",
};

export function DoingItRight() {
  const t = useCopy(RIGHT);
  const { markTool } = useSession();
  const [email, setEmail] = useState("");
  const [hash, setHash] = useState("");
  const normalised = email.trim().toLowerCase();

  useEffect(() => {
    let live = true;
    if (!normalised) {
      setHash("");
      return;
    }
    void sha256(normalised).then((h) => live && setHash(h));
    return () => {
      live = false;
    };
  }, [normalised]);

  return (
    <Section id="right" index="11" title={t.title} lead={t.lead}>
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/50">{t.levelsTitle}</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {t.levels.map(([name, examples, rule, tone]) => (
          <div key={name} className={`bg-[#121216] border-t-2 ${LEVEL_TONE[tone]} p-5`}>
            <h4 className="text-sm font-bold">{name}</h4>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{examples}</p>
            <p className="mt-2 text-xs text-white/50 leading-relaxed">{rule}</p>
          </div>
        ))}
      </div>

      <Card title={t.hashTitle} className="mt-6">
        <p className="text-sm text-white/60 leading-relaxed">{t.hashLead}</p>
        <input
          type="email"
          value={email}
          autoComplete="off"
          placeholder={t.hashPlaceholder}
          onChange={(e) => {
            setEmail(e.target.value);
            markTool("hashing");
          }}
          className="mt-4 w-full max-w-md border border-white/10 bg-[#0A0A0C] px-3 py-2 font-mono text-sm text-[#E0E0E6] outline-none focus:border-cyan-500/50"
        />
        <dl className="mt-4 space-y-2 font-mono text-xs">
          <div>
            <dt className="text-white/40">{t.normalised}</dt>
            <dd className="text-white/80 break-all">{normalised || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">{t.hash}</dt>
            <dd className="text-cyan-300 break-all">{hash || "—"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-amber-300/80 leading-relaxed">⚠ {t.hashNote}</p>
      </Card>

      <h3 className="mt-10 font-mono text-[11px] uppercase tracking-widest text-white/50">{t.principlesTitle}</h3>
      <ol className="mt-3 grid gap-4 md:grid-cols-2">
        {t.principles.map(([title, body], i) => (
          <li key={title} className="bg-[#121216] border border-white/5 p-5 flex gap-4">
            <span className="font-mono text-emerald-400 text-sm">✓{i + 1}</span>
            <div>
              <h4 className="text-sm font-bold text-[#E0E0E6]">{title}</h4>
              <p className="mt-1 text-sm text-white/60 leading-relaxed">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Insight>
        {t.insight}{" "}
        <a href="/whoami/" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
          /whoami
        </a>
      </Insight>
    </Section>
  );
}

const PLAN_ROWS: [string, string, string, string[]][] = [
  ["page_view", "page_location, page_referrer, utm_*", "every page", ["stream", "attribution"]],
  ["search", "search_term", "search", ["personal", "beyond"]],
  ["view_item", "item_id, item_category, price", "product page", ["retargeting", "funnel", "personal"]],
  ["add_to_cart", "item_id, quantity, value, currency", "add to cart", ["retargeting", "funnel"]],
  ["begin_checkout", "value, currency, items", "checkout start", ["retargeting", "funnel"]],
  ["add_payment_info", "payment_type", "payment step", ["funnel", "beyond"]],
  ["purchase", "transaction_id, value, currency, items", "order confirmed", ["attribution", "lookalike", "clv", "abtest"]],
  ["sign_up / login", "method", "account", ["clv", "segments"]],
  ["experiment_view", "experiment_id, variant", "test shown", ["abtest"]],
];

const PLAN = {
  en: {
    title: "A starter tracking plan",
    lead: "You don't need hundreds of events. These nine, named after GA4's recommended events, unlock everything on this page. Write them down with their parameters, agree on names before anyone implements them, and test them before launch.",
    event: "Event",
    params: "Key parameters",
    when: "Sent on",
    unlocks: "Unlocks",
    names: {
      stream: "Analytics", segments: "Segments", retargeting: "Retargeting", lookalike: "Lookalikes", attribution: "Attribution",
      funnel: "Funnels", abtest: "A/B tests", personal: "Personalisation", clv: "CLV", beyond: "Ops & product",
    } as Record<string, string>,
    whens: { "every page": "every page", search: "site search", "product page": "product page", "add to cart": "add to cart", "checkout start": "checkout start", "payment step": "payment step", "order confirmed": "order confirmed", account: "account created / signed in", "test shown": "test variant shown" } as Record<string, string>,
    rules: "Ground rules: snake_case names; no personal data in any parameter; transaction_id on every purchase so it's never counted twice; one owner per event.",
    insight:
      "A short, written tracking plan is the cheapest data investment a company can make. It turns tracking from \"whatever the agency installed\" into an asset the whole company can rely on.",
  },
  id: {
    title: "Tracking plan awal",
    lead: "Kamu tidak butuh ratusan event. Sembilan event ini, dinamai sesuai event rekomendasi GA4, sudah membuka semua yang ada di halaman ini. Tulis beserta parameternya, sepakati namanya sebelum ada yang mengimplementasikan, dan uji sebelum rilis.",
    event: "Event",
    params: "Parameter utama",
    when: "Dikirim saat",
    unlocks: "Membuka",
    names: {
      stream: "Analitik", segments: "Segmen", retargeting: "Retargeting", lookalike: "Lookalike", attribution: "Atribusi",
      funnel: "Funnel", abtest: "A/B test", personal: "Personalisasi", clv: "CLV", beyond: "Operasional & produk",
    } as Record<string, string>,
    whens: { "every page": "setiap halaman", search: "pencarian di situs", "product page": "halaman produk", "add to cart": "tambah ke keranjang", "checkout start": "mulai checkout", "payment step": "langkah pembayaran", "order confirmed": "pesanan dikonfirmasi", account: "akun dibuat / masuk", "test shown": "varian tes ditampilkan" } as Record<string, string>,
    rules: "Aturan dasar: nama snake_case; tidak ada data pribadi di parameter mana pun; transaction_id di setiap pembelian supaya tidak terhitung dua kali; satu pemilik per event.",
    insight:
      "Tracking plan yang singkat dan tertulis adalah investasi data termurah yang bisa dilakukan perusahaan. Ia mengubah tracking dari \"apa pun yang dipasang agensi\" menjadi aset yang bisa diandalkan seluruh perusahaan.",
  },
};

export function TrackingPlan() {
  const t = useCopy(PLAN);
  return (
    <Section id="plan" index="12" title={t.title} lead={t.lead}>
      <div className="overflow-x-auto bg-[#121216] border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left font-mono text-[11px] uppercase tracking-widest text-white/40">
              <th className="p-3 font-normal">{t.event}</th>
              <th className="p-3 font-normal">{t.params}</th>
              <th className="p-3 font-normal">{t.when}</th>
              <th className="p-3 font-normal">{t.unlocks}</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map(([event, params, when, unlocks]) => (
              <tr key={event} className="border-b border-white/5 last:border-0 align-top">
                <td className="p-3 font-mono text-cyan-300 whitespace-nowrap">{event}</td>
                <td className="p-3 font-mono text-xs text-white/60">{params}</td>
                <td className="p-3 text-white/60">{t.whens[when]}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {unlocks.map((u) => (
                      <a key={u} href={`#${u}`} className="border border-white/10 px-2 py-0.5 text-[11px] text-white/60 hover:border-cyan-500/50 hover:text-cyan-300">
                        {t.names[u]}
                      </a>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-white/50 leading-relaxed">{t.rules}</p>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}
