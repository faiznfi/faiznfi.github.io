import { useState } from "react";
import { track } from "../lib/analytics";
import { Button, Card, Insight } from "./ui";
import { useCopy } from "./i18n";

const COPY = {
  en: {
    title: "What's on your clipboard?",
    lead: "Copy something first, anything you've got, maybe the last password or code you pasted. Then let this page read your clipboard with one click. People copy passwords and one-time codes constantly, then paste them into a page that quietly keeps a copy.",
    readTitle: "Read my clipboard",
    pasteBtn: "Paste what I last copied",
    note: "Chrome may show a small permission prompt the first time. Nothing is stored or sent.",
    readTitle2: "What the page just read",
    warnOtp: "That looks like an OTP or PIN.",
    warnCard: "That looks like a card or account number.",
    warnPass: "That could be a password or token.",
    statusIdle: "Nothing yet. Copy some text, then press the button.",
    statusEmpty: "Your clipboard is empty (or holds an image this demo can't read).",
    statusDenied: "You denied clipboard access. Good call, on a site you don't trust.",
    statusUnsupported: "This browser blocks clipboard reads from a page (Firefox, for example).",
    insight:
      "Never paste a password or recovery phrase into a page you don't fully trust, and clear your clipboard after copying secrets. A password manager that types into fields directly, instead of via copy and paste, avoids leaving secrets on the clipboard.",
  },
  id: {
    title: "Apa yang ada di clipboard kamu?",
    lead: "Salin sesuatu dulu, apa saja yang kamu punya, mungkin kata sandi atau kode terakhir yang kamu tempel. Lalu biarkan halaman ini membaca clipboard kamu dengan satu klik. Orang terus-menerus menyalin kata sandi dan kode sekali pakai, lalu menempelkannya ke halaman yang diam-diam menyimpan salinannya.",
    readTitle: "Baca clipboard saya",
    pasteBtn: "Tempel yang terakhir saya salin",
    note: "Chrome mungkin menampilkan prompt izin kecil saat pertama kali. Tidak ada yang disimpan atau dikirim.",
    readTitle2: "Yang baru dibaca halaman",
    warnOtp: "Itu terlihat seperti OTP atau PIN.",
    warnCard: "Itu terlihat seperti nomor kartu atau rekening.",
    warnPass: "Itu bisa jadi kata sandi atau token.",
    statusIdle: "Belum ada. Salin sebagian teks, lalu tekan tombolnya.",
    statusEmpty: "Clipboard kamu kosong (atau berisi gambar yang tidak bisa dibaca demo ini).",
    statusDenied: "Kamu menolak akses clipboard. Keputusan bagus, di situs yang tidak kamu percaya.",
    statusUnsupported: "Browser ini memblokir pembacaan clipboard dari halaman (Firefox, misalnya).",
    insight:
      "Jangan pernah menempel kata sandi atau frasa pemulihan ke halaman yang tidak sepenuhnya kamu percaya, dan bersihkan clipboard setelah menyalin rahasia. Pengelola kata sandi yang mengetik langsung ke kolom, bukan lewat salin-tempel, menghindari meninggalkan rahasia di clipboard.",
  },
};

/**
 * Clipboard snooping: a single click lets a page read whatever you last
 * copied, which is often a password, an OTP or an account number. The value
 * is shown back here only and never stored or sent.
 */
export function ClipboardDemo() {
  const t = useCopy(COPY);
  const [value, setValue] = useState<string>();
  const [status, setStatus] = useState<"idle" | "empty" | "denied" | "unsupported">("idle");

  async function paste() {
    if (!navigator.clipboard?.readText) {
      setStatus("unsupported");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      setStatus(text ? "idle" : "empty");
      track("whoami_action", { demo_action: "clipboard", demo_result: text ? "granted" : "started" });
    } catch {
      setStatus("denied");
      track("whoami_action", { demo_action: "clipboard", demo_result: "denied" });
    }
  }

  function looksSensitive(text: string) {
    if (/^\d{4,8}$/.test(text.trim())) return t.warnOtp;
    if (/\d{9,}/.test(text.replace(/\s/g, ""))) return t.warnCard;
    if (/[A-Za-z0-9]{12,}/.test(text) && /[^A-Za-z0-9]/.test(text)) return t.warnPass;
    return undefined;
  }

  const warning = value ? looksSensitive(value) : undefined;

  return (
    <section id="clipboard" aria-labelledby="clip-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[11]</span>
      <h2 id="clip-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {t.title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">{t.lead}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title={t.readTitle}>
          <Button onClick={paste}>{t.pasteBtn}</Button>
          <p className="mt-3 text-xs text-white/40">{t.note}</p>
        </Card>
        <Card title={t.readTitle2}>
          {value ? (
            <>
              <div className="font-mono text-sm text-pink-400 break-all bg-[#0A0A0C] border border-white/10 p-3">{value}</div>
              {warning && <p className="mt-3 text-sm text-amber-300/90">⚠ {warning}</p>}
            </>
          ) : (
            <p className="text-sm text-white/50">
              {status === "idle" && t.statusIdle}
              {status === "empty" && t.statusEmpty}
              {status === "denied" && t.statusDenied}
              {status === "unsupported" && t.statusUnsupported}
            </p>
          )}
        </Card>
      </div>

      <Insight>{t.insight}</Insight>
    </section>
  );
}
