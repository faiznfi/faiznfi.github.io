import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "id";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

/**
 * Language is kept in React state only — never in a cookie or localStorage.
 * This page's point is that nothing is stored, and section 04 lists any
 * localStorage keys, so persisting a preference would contradict the message.
 * Each component co-locates its own bilingual copy and reads `lang` from here.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("id") ? "id" : "en",
  );
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

/** Pick the current language's copy from a `{ en, id }` object. */
export function useCopy<T>(copy: Record<Lang, T>): T {
  return copy[useLang().lang];
}

/** Compact EN / ID switch shown in the header. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 font-mono text-[11px]">
      {(["en", "id"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2 py-1 uppercase tracking-widest transition-colors ${
            lang === code
              ? "text-cyan-400 border border-cyan-500/40"
              : "text-white/40 border border-transparent hover:text-white/70"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

/**
 * Full-screen chooser shown once on load, so visitors pick a language first.
 * `onChosen` lets the page defer the auto camera/location prompts until the
 * choice is made.
 */
export function LangGate({ onChosen }: { onChosen: () => void }) {
  const { setLang } = useLang();
  const [chosen, setChosen] = useState(false);
  if (chosen) return null;

  function choose(lang: Lang) {
    setLang(lang);
    setChosen(true);
    onChosen();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0C] px-6">
      <div className="w-full max-w-md text-center">
        <span className="font-mono text-cyan-500 text-xs">$ whoami</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#E0E0E6]">
          Choose a language
          <span className="block text-white/40 italic font-light">Pilih bahasa</span>
        </h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose("en")}
            className="border border-white/15 p-6 hover:border-cyan-500/50 hover:bg-white/5 transition-colors"
          >
            <div className="text-lg font-bold text-[#E0E0E6]">English</div>
            <div className="mt-1 text-xs text-white/50">See what this site knows about you</div>
          </button>
          <button
            type="button"
            onClick={() => choose("id")}
            className="border border-white/15 p-6 hover:border-cyan-500/50 hover:bg-white/5 transition-colors"
          >
            <div className="text-lg font-bold text-[#E0E0E6]">Bahasa Indonesia</div>
            <div className="mt-1 text-xs text-white/50">Lihat apa yang situs ini tahu tentang kamu</div>
          </button>
        </div>
        <p className="mt-8 text-xs text-white/35">You can switch language anytime · Bisa ganti bahasa kapan saja</p>
      </div>
    </div>
  );
}
