import { Card, Insight, Row, Rows, Section } from "../whoami/ui";
import { useCopy, useLang } from "../whoami/i18n";
import { useElapsed, useSession } from "./useSession";

const STREAM = {
  en: {
    title: "You are anonymous, and still useful",
    lead: "Since you opened this page, it has been recording what you do: which sections you read, how far you scroll, which tools you try. It's tied to a random ID, not your name. That's all a company needs to understand what works. This log lives in this tab only; reload and you become a new visitor.",
    idTitle: "Your anonymous visitor",
    id: "Visitor ID",
    idHint: "random, regenerated on every load",
    time: "Time on page",
    device: "Device class",
    source: "Traffic source",
    sections: "Sections viewed",
    scroll: "Max scroll depth",
    tools: "Tools used",
    logTitle: "Live event stream",
    empty: "Waiting for your first event…",
    notCollected: "Not collected: name, email, phone, IP address, exact location, fingerprint.",
    insight:
      "This is how good tracking looks: events, not identities. Every benefit on this page, from retargeting to A/B tests, runs on a stream like this one, joined to an ID that says \"the same browser\" and nothing about who the person is.",
  },
  id: {
    title: "Kamu anonim, tapi tetap berguna",
    lead: "Sejak kamu membuka halaman ini, ia mencatat apa yang kamu lakukan: bagian mana yang kamu baca, seberapa jauh kamu scroll, alat apa yang kamu coba. Semuanya terikat ke ID acak, bukan namamu. Hanya itu yang dibutuhkan perusahaan untuk memahami apa yang berhasil. Log ini hanya ada di tab ini; muat ulang dan kamu menjadi pengunjung baru.",
    idTitle: "Pengunjung anonim kamu",
    id: "ID pengunjung",
    idHint: "acak, dibuat ulang setiap kali halaman dimuat",
    time: "Waktu di halaman",
    device: "Jenis perangkat",
    source: "Sumber trafik",
    sections: "Bagian yang dilihat",
    scroll: "Scroll terdalam",
    tools: "Alat yang dipakai",
    logTitle: "Aliran event langsung",
    empty: "Menunggu event pertamamu…",
    notCollected: "Tidak dikumpulkan: nama, email, nomor HP, alamat IP, lokasi persis, fingerprint.",
    insight:
      "Seperti inilah tracking yang baik: event, bukan identitas. Semua manfaat di halaman ini, dari retargeting sampai A/B test, berjalan di atas aliran seperti ini, yang digabungkan dengan ID yang hanya berarti \"browser yang sama\" dan tidak mengatakan apa pun tentang siapa orangnya.",
  },
};

export function EventStream() {
  const t = useCopy(STREAM);
  const s = useSession();
  const seconds = useElapsed(s.startedAt);
  const recent = s.events.slice(-14).reverse();

  return (
    <Section id="stream" index="01" title={t.title} lead={t.lead}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card title={t.idTitle}>
          <Rows>
            <Row label={t.id} value={s.anonId} hint={t.idHint} />
            <Row label={t.time} value={`${seconds}s`} />
            <Row label={t.device} value={s.device} />
            <Row label={t.source} value={s.source} />
            <Row label={t.sections} value={s.sectionsViewed.length} />
            <Row label={t.scroll} value={`${s.maxScroll}%`} />
            <Row label={t.tools} value={s.toolsUsed.length} />
          </Rows>
          <p className="mt-4 text-xs text-emerald-300/80">✓ {t.notCollected}</p>
        </Card>
        <Card title={t.logTitle}>
          <ol className="font-mono text-xs space-y-1.5 max-h-[22rem] overflow-hidden" aria-live="polite">
            {recent.length === 0 && <li className="text-white/40">{t.empty}</li>}
            {recent.map((e, i) => (
              <li key={`${e.t}-${e.name}-${i}`} className="flex gap-3">
                <span className="text-white/30 tabular-nums w-14 shrink-0 text-right">{(e.t / 1000).toFixed(1)}s</span>
                <span className="text-cyan-400 shrink-0">{e.name}</span>
                <span className="text-white/50 truncate">
                  {e.params &&
                    Object.entries(e.params)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(" ")}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}

const SEGMENTS = {
  en: {
    title: "Segments: grouping people by what they do",
    lead: "Raw events become segments with simple rules. Each segment is a group you can talk to differently. These rules are being evaluated against your visit right now.",
    rule: "Rule",
    use: "What a company does with it",
    inSeg: "You're in",
    notIn: "Not yet",
    insight:
      "Segments are where data turns into decisions. A newsletter for engaged readers, a simpler page for mobile visitors, a different welcome for people who came from an ad. None of it needs to know who anyone is.",
    items: {
      engaged: ["Engaged reader", "Viewed 4 or more sections", "Invite to the newsletter; they're likely to come back for more."],
      deep: ["Deep scroller", "Scrolled past 75% of the page", "Show the call to action at the end, not the top."],
      tool: ["Hands-on", "Used at least one calculator", "Offer a template or a free trial; they learn by doing."],
      mobile: ["Mobile visitor", "Screen narrower than 640 px", "Shorter forms, one-tap payment, WhatsApp contact button."],
      social: ["Social arrival", "Came from a social network or a campaign link", "Match the ad's promise on the landing page; judge the campaign by what these visitors do."],
      bounce: ["Quick exit risk", "Under 20 seconds and fewer than 2 sections", "Test a clearer headline; exclude from retargeting, they weren't interested."],
    } as Record<string, [string, string, string]>,
  },
  id: {
    title: "Segmen: mengelompokkan orang dari apa yang mereka lakukan",
    lead: "Event mentah menjadi segmen dengan aturan sederhana. Setiap segmen adalah kelompok yang bisa kamu ajak bicara dengan cara berbeda. Aturan ini sedang dievaluasi terhadap kunjunganmu saat ini.",
    rule: "Aturan",
    use: "Yang dilakukan perusahaan",
    inSeg: "Kamu termasuk",
    notIn: "Belum",
    insight:
      "Segmen adalah tempat data berubah menjadi keputusan. Newsletter untuk pembaca yang terlibat, halaman lebih ringkas untuk pengunjung mobile, sambutan berbeda untuk yang datang dari iklan. Tidak ada yang perlu tahu siapa orangnya.",
    items: {
      engaged: ["Pembaca terlibat", "Melihat 4 bagian atau lebih", "Ajak berlangganan newsletter; mereka kemungkinan kembali lagi."],
      deep: ["Penjelajah dalam", "Scroll melewati 75% halaman", "Taruh ajakan bertindak di akhir, bukan di atas."],
      tool: ["Suka mencoba", "Memakai minimal satu kalkulator", "Tawarkan template atau free trial; mereka belajar dengan praktik."],
      mobile: ["Pengunjung mobile", "Layar lebih sempit dari 640 px", "Formulir lebih pendek, pembayaran sekali ketuk, tombol kontak WhatsApp."],
      social: ["Datang dari sosial", "Datang dari media sosial atau tautan kampanye", "Samakan janji iklan dengan halaman tujuan; nilai kampanye dari apa yang dilakukan pengunjung ini."],
      bounce: ["Risiko cepat keluar", "Kurang dari 20 detik dan kurang dari 2 bagian", "Uji judul yang lebih jelas; keluarkan dari retargeting, mereka memang tidak tertarik."],
    } as Record<string, [string, string, string]>,
  },
};

export function Segments() {
  const t = useCopy(SEGMENTS);
  const { lang } = useLang();
  const s = useSession();
  const seconds = useElapsed(s.startedAt);
  const membership: Record<string, boolean> = {
    engaged: s.sectionsViewed.length >= 4,
    deep: s.maxScroll >= 75,
    tool: s.toolsUsed.length > 0,
    mobile: s.device === "mobile",
    social: /social|\//.test(s.source) && !/organic|referral/.test(s.source),
    bounce: seconds < 20 && s.sectionsViewed.length < 2,
  };

  return (
    <Section id="segments" index="02" title={t.title} lead={t.lead}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(t.items).map(([key, [name, rule, use]]) => {
          const inSeg = membership[key];
          return (
            <div
              key={key}
              className={`border p-5 transition-colors ${inSeg ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/5 bg-[#121216]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-[#E0E0E6]">{name}</h3>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${inSeg ? "text-cyan-400" : "text-white/30"}`}>
                  {inSeg ? `● ${t.inSeg}` : t.notIn}
                </span>
              </div>
              <p className="mt-3 font-mono text-[11px] text-white/40">
                {t.rule}: <span className="text-white/60">{rule}</span>
              </p>
              <p className="mt-2 text-sm text-white/60 leading-relaxed" lang={lang}>
                {use}
              </p>
            </div>
          );
        })}
      </div>
      <Insight>{t.insight}</Insight>
    </Section>
  );
}
