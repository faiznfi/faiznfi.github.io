import type { ReactNode } from "react";

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-white/50">{label}</span>
      <span className="mt-1 flex items-center border border-white/10 bg-[#0A0A0C] focus-within:border-cyan-500/50">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="w-full bg-transparent px-3 py-2 font-mono text-sm text-[#E0E0E6] outline-none"
        />
        {suffix && <span className="pr-3 font-mono text-xs text-white/40">{suffix}</span>}
      </span>
    </label>
  );
}

/** Horizontal bar with a label and value, width as a 0–1 share. */
export function Bar({ label, share, value, tone = "cyan" }: { label: ReactNode; share: number; value: ReactNode; tone?: "cyan" | "pink" | "emerald" }) {
  const color = tone === "pink" ? "bg-pink-500/70" : tone === "emerald" ? "bg-emerald-500/70" : "bg-cyan-500/70";
  return (
    <div>
      <div className="flex justify-between gap-3 text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white/80 tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-2 bg-white/5">
        <div className={`h-full ${color} transition-[width] duration-300`} style={{ width: `${Math.max(0, Math.min(1, share)) * 100}%` }} />
      </div>
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
        active ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

export function UseCases({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(([title, body]) => (
        <div key={title} className="bg-[#121216] border border-white/5 p-5">
          <h3 className="text-sm font-bold text-[#E0E0E6]">{title}</h3>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  );
}

export const fmtNum = (n: number, locale: string, digits = 0) =>
  Number.isFinite(n) ? n.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }) : "–";

export const fmtPct = (n: number, locale: string, digits = 1) =>
  Number.isFinite(n) ? `${(n * 100).toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits })}%` : "–";
