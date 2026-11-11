export function Tag({ children }: { children: string }) {
  return (
    <span className="px-2 py-1 text-[11px] font-mono bg-white/5 border border-white/10 text-white/70 uppercase">
      {children}
    </span>
  );
}

export function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" role="list">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
