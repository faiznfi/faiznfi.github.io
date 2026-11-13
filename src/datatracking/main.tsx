import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DataTracking } from "./DataTracking";
import { LangProvider } from "../whoami/i18n";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <DataTracking />
    </LangProvider>
  </StrictMode>,
);
