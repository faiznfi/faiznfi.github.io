import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WhoAmI } from "./WhoAmI";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WhoAmI />
  </StrictMode>,
);
