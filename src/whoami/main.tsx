import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WhoAmI } from "./WhoAmI";
import { LangProvider } from "./i18n";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <WhoAmI />
    </LangProvider>
  </StrictMode>,
);
