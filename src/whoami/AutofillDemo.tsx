import { useRef, useState } from "react";
import { track } from "../lib/analytics";
import { Card, Insight } from "./ui";
import { useCopy } from "./i18n";

const HIDDEN_FIELDS = [
  { name: "tel", auto: "tel", key: "tel" },
  { name: "street-address", auto: "street-address", key: "street" },
  { name: "postal-code", auto: "postal-code", key: "postal" },
  { name: "bday", auto: "bday", key: "bday" },
  { name: "organization", auto: "organization", key: "company" },
  { name: "cc-name", auto: "cc-name", key: "cardName" },
] as const;

const COPY = {
  en: {
    title: "A form that asks for two things and takes eight",
    leadA: "This form only shows ",
    leadMid: " and ",
    leadB: ". But off-screen, where you can't see, it also asks your browser for your phone, address, birthday, company and card name. If you use autofill, the browser fills those too.",
    signupTitle: "Sign up (looks harmless)",
    continue: "Continue",
    formNote: "Use your browser's autofill on the name field, then press Continue. Nothing is submitted or sent.",
    capturedTitle: "What the hidden fields actually captured",
    nothing: "Nothing captured. Either you typed by hand, or your browser's autofill had no saved profile. Try autofilling the name field.",
    pressContinue: "Press Continue to see everything the form collected.",
    insight:
      "Phishing kits use this to collect a full identity from a form that looks like it only wants an email. Protect yourself by keeping little or no data in your browser's autofill profile, and by reviewing the autofill dropdown before accepting it.",
    labels: { name: "Name", email: "Email", tel: "Phone", street: "Street address", postal: "Postal code", bday: "Date of birth", company: "Company", cardName: "Cardholder name" },
  },
  id: {
    title: "Formulir yang minta dua hal dan mengambil delapan",
    leadA: "Formulir ini hanya menampilkan ",
    leadMid: " dan ",
    leadB: ". Tapi di luar layar, di tempat yang tidak kamu lihat, formulir ini juga meminta nomor telepon, alamat, tanggal lahir, perusahaan, dan nama kartu kamu ke browser. Kalau kamu pakai autofill, browser mengisi itu semua juga.",
    signupTitle: "Daftar (terlihat tak berbahaya)",
    continue: "Lanjut",
    formNote: "Pakai autofill browser di kolom nama, lalu tekan Lanjut. Tidak ada yang dikirim.",
    capturedTitle: "Yang sebenarnya ditangkap kolom tersembunyi",
    nothing: "Tidak ada yang tertangkap. Mungkin kamu mengetik manual, atau autofill browser kamu tidak punya profil tersimpan. Coba autofill kolom nama.",
    pressContinue: "Tekan Lanjut untuk melihat semua yang dikumpulkan formulir.",
    insight:
      "Perangkat phishing memakai ini untuk mengumpulkan identitas lengkap dari formulir yang seolah hanya minta email. Lindungi diri dengan menyimpan sedikit atau tanpa data di profil autofill browser kamu, dan dengan memeriksa dropdown autofill sebelum menerimanya.",
    labels: { name: "Nama", email: "Email", tel: "Telepon", street: "Alamat", postal: "Kode pos", bday: "Tanggal lahir", company: "Perusahaan", cardName: "Nama pemegang kartu" },
  },
};

/**
 * Autofill harvesting: the visible form asks only for name and email, but
 * off-screen fields request far more. When the browser autofills, it fills
 * those too. Everything captured is shown back here and never sent anywhere.
 */
export function AutofillDemo() {
  const t = useCopy(COPY);
  const formRef = useRef<HTMLFormElement>(null);
  const [captured, setCaptured] = useState<{ label: string; value: string }[]>();

  function reveal() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const visible = [
      { label: t.labels.name, value: String(data.get("name") ?? "") },
      { label: t.labels.email, value: String(data.get("email") ?? "") },
    ];
    const hidden = HIDDEN_FIELDS.map((f) => ({ label: t.labels[f.key], value: String(data.get(f.name) ?? "") })).filter(
      (f) => f.value,
    );
    setCaptured([...visible.filter((v) => v.value), ...hidden]);
    track("whoami_action", { demo_action: "autofill", demo_result: hidden.length ? "granted" : "started" });
  }

  return (
    <section id="autofill" aria-labelledby="autofill-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[10]</span>
      <h2 id="autofill-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {t.title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">
        {t.leadA}
        <span className="text-white">{t.labels.name}</span>
        {t.leadMid}
        <span className="text-white">{t.labels.email}</span>
        {t.leadB}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title={t.signupTitle}>
          <form ref={formRef} onSubmit={(e) => e.preventDefault()} autoComplete="on">
            <label className="block text-sm text-white/60 mb-1" htmlFor="af-name">{t.labels.name}</label>
            <input id="af-name" name="name" autoComplete="name" className="mb-4 w-full bg-[#0A0A0C] border border-white/10 p-3 text-sm text-[#E0E0E6] focus:outline-none focus:border-cyan-500/50" />
            <label className="block text-sm text-white/60 mb-1" htmlFor="af-email">{t.labels.email}</label>
            <input id="af-email" name="email" type="email" autoComplete="email" className="w-full bg-[#0A0A0C] border border-white/10 p-3 text-sm text-[#E0E0E6] focus:outline-none focus:border-cyan-500/50" />

            {/* Off-screen fields: present and fillable, but not visible. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0, height: 0, overflow: "hidden" }}>
              {HIDDEN_FIELDS.map((f) => (
                <input key={f.name} name={f.name} autoComplete={f.auto} tabIndex={-1} />
              ))}
            </div>

            <button type="button" onClick={reveal} className="mt-5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors">
              {t.continue}
            </button>
          </form>
          <p className="mt-3 text-xs text-white/40">{t.formNote}</p>
        </Card>

        <Card title={t.capturedTitle}>
          {captured ? (
            captured.length ? (
              <dl className="divide-y divide-white/5">
                {captured.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-sm text-white/50">{f.label}</dt>
                    <dd className="font-mono text-sm text-pink-400 break-all text-right">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-white/50">{t.nothing}</p>
            )
          ) : (
            <p className="text-sm text-white/50">{t.pressContinue}</p>
          )}
        </Card>
      </div>

      <Insight>{t.insight}</Insight>
    </section>
  );
}
