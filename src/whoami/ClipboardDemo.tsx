import { useState } from "react";
import { track } from "../lib/analytics";
import { Button, Card, Insight } from "./ui";

/**
 * Clipboard snooping: a single click lets a page read whatever you last
 * copied, which is often a password, an OTP or an account number. The value
 * is shown back here only and never stored or sent.
 */
export function ClipboardDemo() {
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
    if (/^\d{4,8}$/.test(text.trim())) return "That looks like an OTP or PIN.";
    if (/\d{9,}/.test(text.replace(/\s/g, ""))) return "That looks like a card or account number.";
    if (/[A-Za-z0-9]{12,}/.test(text) && /[^A-Za-z0-9]/.test(text)) return "That could be a password or token.";
    return undefined;
  }

  const warning = value ? looksSensitive(value) : undefined;

  return (
    <section id="clipboard" aria-labelledby="clip-title" className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[11]</span>
      <h2 id="clip-title" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        What's on your clipboard?
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">
        Copy something first, anything you've got, maybe the last password or code you pasted. Then let this page read
        your clipboard with one click. People copy passwords and one-time codes constantly, then paste them into a page
        that quietly keeps a copy.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title="Read my clipboard">
          <Button onClick={paste}>Paste what I last copied</Button>
          <p className="mt-3 text-xs text-white/40">Chrome may show a small permission prompt the first time. Nothing is stored or sent.</p>
        </Card>
        <Card title="What the page just read">
          {value ? (
            <>
              <div className="font-mono text-sm text-pink-400 break-all bg-[#0A0A0C] border border-white/10 p-3">{value}</div>
              {warning && <p className="mt-3 text-sm text-amber-300/90">⚠ {warning}</p>}
            </>
          ) : (
            <p className="text-sm text-white/50">
              {status === "idle" && "Nothing yet. Copy some text, then press the button."}
              {status === "empty" && "Your clipboard is empty (or holds an image this demo can't read)."}
              {status === "denied" && "You denied clipboard access. Good call, on a site you don't trust."}
              {status === "unsupported" && "This browser blocks clipboard reads from a page (Firefox, for example)."}
            </p>
          )}
        </Card>
      </div>

      <Insight>
        Never paste a password or recovery phrase into a page you don't fully trust, and clear your clipboard after
        copying secrets. A password manager that types into fields directly, instead of via copy and paste, avoids
        leaving secrets on the clipboard.
      </Insight>
    </section>
  );
}
