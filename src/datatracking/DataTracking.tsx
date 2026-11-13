import { LangToggle, useCopy } from "../whoami/i18n";
import { SessionContext, useSessionState } from "./useSession";
import { EventStream, Segments } from "./SessionDemo";
import { Lookalike, Retargeting } from "./Retargeting";
import { Attribution } from "./Attribution";
import { AbTest, Funnel } from "./Optimize";
import { Clv, Personalisation } from "./Value";
import { Beyond, DoingItRight, TrackingPlan } from "./Governance";

const COPY = {
  en: {
    back: "← faiznfi.github.io",
    visitor: "you are",
    h1a: "Collected right,",
    h1b: "data pays for itself.",
    intro:
      "The whoami page shows how much a website can learn about you, and why that should worry you. This is the other side. When a company tracks behaviour anonymously, with consent and a clear plan, it can spend less on ads, fix what's broken, and give customers what they actually want. Here's how, with tools you can try on your own numbers.",
    honestLabel: "This page tracks you, honestly.",
    honestBody:
      "Your visit below is recorded under a random ID, in this tab's memory only, to show what good tracking looks like. Nothing is stored or sent. Like the rest of this site, the page also reports anonymous usage counts to Google Analytics, without the values you type into the tools.",
    contents: "Contents",
    toc: [
      ["stream", "Anonymous event stream"], ["segments", "Segments"], ["retargeting", "Retargeting"], ["lookalike", "Lookalike audiences"],
      ["attribution", "Attribution"], ["funnel", "Funnels"], ["abtest", "A/B testing"], ["personal", "Personalisation"],
      ["clv", "Customer lifetime value"], ["beyond", "Beyond marketing"], ["right", "Doing it right"], ["plan", "Starter tracking plan"],
    ],
    other: "The other side: what every website knows about you →",
    footer: "Built for a data-tracking lecture by Faiz Insani · the calculators run in your browser; nothing you type is stored.",
  },
  id: {
    back: "← faiznfi.github.io",
    visitor: "kamu adalah",
    h1a: "Dikumpulkan dengan benar,",
    h1b: "data membayar dirinya sendiri.",
    intro:
      "Halaman whoami menunjukkan seberapa banyak situs bisa tahu tentang kamu, dan kenapa itu perlu dikhawatirkan. Ini sisi sebaliknya. Ketika perusahaan melacak perilaku secara anonim, dengan persetujuan dan rencana yang jelas, ia bisa menghemat anggaran iklan, memperbaiki yang rusak, dan memberi pelanggan apa yang benar-benar mereka mau. Begini caranya, dengan alat yang bisa kamu coba pakai angkamu sendiri.",
    honestLabel: "Halaman ini melacakmu, secara jujur.",
    honestBody:
      "Kunjunganmu di bawah dicatat dengan ID acak, hanya di memori tab ini, untuk menunjukkan seperti apa tracking yang baik. Tidak ada yang disimpan atau dikirim. Seperti bagian lain situs ini, halaman ini juga melaporkan hitungan penggunaan anonim ke Google Analytics, tanpa angka yang kamu ketik di alat-alatnya.",
    contents: "Daftar isi",
    toc: [
      ["stream", "Aliran event anonim"], ["segments", "Segmen"], ["retargeting", "Retargeting"], ["lookalike", "Lookalike audience"],
      ["attribution", "Atribusi"], ["funnel", "Funnel"], ["abtest", "A/B testing"], ["personal", "Personalisasi"],
      ["clv", "Customer lifetime value"], ["beyond", "Di luar marketing"], ["right", "Melakukannya dengan benar"], ["plan", "Tracking plan awal"],
    ],
    other: "Sisi sebaliknya: apa yang diketahui setiap situs tentang kamu →",
    footer: "Dibuat untuk kuliah data tracking oleh Faiz Insani · kalkulator berjalan di browsermu; tidak ada yang kamu ketik yang disimpan.",
  },
};

export function DataTracking() {
  const t = useCopy(COPY);
  const session = useSessionState();

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E6] font-sans selection:bg-cyan-500/30">
        <div className="container mx-auto max-w-5xl px-6">
          <header className="flex items-center justify-between py-6 font-mono text-xs">
            <a href="/" className="text-white/50 hover:text-cyan-400 transition-colors">
              {t.back}
            </a>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-white/40">
                {t.visitor} <span className="text-cyan-400">{session.anonId}</span>
              </span>
              <LangToggle />
            </div>
          </header>

          <div className="pt-12 pb-16">
            <span className="font-mono text-cyan-500 text-xs">$ datatracking</span>
            <h1 className="mt-4 text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              {t.h1a}
              <br />
              <span className="text-white/40 italic font-light">{t.h1b}</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">{t.intro}</p>
            <div className="mt-8 max-w-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200/90 leading-relaxed">
              <strong className="font-mono text-xs uppercase tracking-widest text-emerald-400">{t.honestLabel}</strong> {t.honestBody}
            </div>
            <nav aria-label={t.contents} className="mt-10">
              <h2 className="font-mono text-[11px] uppercase tracking-widest text-white/40">{t.contents}</h2>
              <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                {t.toc.map(([id, label], i) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-white/60 hover:text-cyan-400 transition-colors">
                      <span className="font-mono text-cyan-500/70 mr-2">{String(i + 1).padStart(2, "0")}</span>
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <a href="/whoami/" className="mt-8 inline-block font-mono text-xs text-pink-400 hover:text-pink-300">
              {t.other}
            </a>
          </div>

          <EventStream />
          <Segments />
          <Retargeting />
          <Lookalike />
          <Attribution />
          <Funnel />
          <AbTest />
          <Personalisation />
          <Clv />
          <Beyond />
          <DoingItRight />
          <TrackingPlan />

          <footer className="border-t border-white/5 py-10 font-mono text-[11px] text-white/40 flex flex-col sm:flex-row justify-between gap-4">
            <span>{t.footer}</span>
            <span className="flex gap-6">
              <a href="/whoami/" className="text-cyan-400 hover:text-cyan-300">/whoami</a>
              <a href="/" className="text-cyan-400 hover:text-cyan-300">faiznfi.github.io</a>
            </span>
          </footer>
        </div>
      </div>
    </SessionContext.Provider>
  );
}
