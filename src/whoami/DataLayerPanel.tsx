import { useEffect, useState } from "react";
import { Card } from "./ui";

/** Live view of everything this page pushed to Google Tag Manager. */
export function DataLayerPanel() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const read = () =>
      setMessages(
        (window.dataLayer ?? [])
          .filter((m) => typeof m === "object" && m !== null && "event" in m)
          .map((m) => JSON.stringify(m, null, 1).replace(/\n\s*/g, " ")),
      );
    read();
    const id = window.setInterval(read, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card title={`window.dataLayer: ${messages.length} events (live)`}>
      <ol className="max-h-80 overflow-auto space-y-1 font-mono text-xs text-white/70">
        {messages.map((m, i) => (
          <li key={i} className="break-all">
            <span className="text-white/30 mr-2">{String(i + 1).padStart(2, "0")}</span>
            {m}
          </li>
        ))}
      </ol>
    </Card>
  );
}
