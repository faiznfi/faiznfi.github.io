import type { ReactNode } from "react";

export type Value = string | number | boolean | null | undefined;

export function formatValue(value: Value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

interface SectionProps {
  id: string;
  index: string;
  title: string;
  lead: ReactNode;
  children: ReactNode;
}

export function Section({ id, index, title, lead, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-16 border-t border-white/5 scroll-mt-8">
      <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">[{index}]</span>
      <h2 id={`${id}-title`} className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-[#E0E0E6]">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-relaxed">{lead}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#121216] border border-white/5 p-6 ${className}`}>
      {title && <h3 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-white/50">{title}</h3>}
      {children}
    </div>
  );
}

export function Rows({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-white/5">{children}</dl>;
}

export function Row({ label, value, hint }: { label: string; value: Value; hint?: string }) {
  const shown = formatValue(value);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 gap-y-1 py-2.5">
      <dt className="text-sm text-white/50">{label}</dt>
      <dd className="min-w-0">
        <span className={`font-mono text-sm break-words ${shown ? "text-[#E0E0E6]" : "text-white/30"}`}>
          {shown ?? "not exposed"}
        </span>
        {hint && <span className="block text-xs text-white/40 mt-0.5">{hint}</span>}
      </dd>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="bg-[#121216] border border-white/5 p-4">
      <div className="font-mono text-2xl text-cyan-400 tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-white/60">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-white/35">{hint}</div>}
    </div>
  );
}

export function Insight({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 border-l-2 border-pink-500/60 pl-4 text-sm text-white/70 leading-relaxed">
      <span className="font-mono text-[11px] uppercase tracking-widest text-pink-400 mr-2">Why it matters</span>
      {children}
    </p>
  );
}

export function Button({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 border border-cyan-500/40 text-cyan-400 text-xs font-mono uppercase tracking-widest hover:bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs text-amber-300/80 leading-relaxed">⚠ {children}</p>;
}
