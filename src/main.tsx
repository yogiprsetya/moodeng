import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "./styles/theme-miro.css";
import "./styles/theme-lofi.css";
import "./styles/theme-nord.css";
import "./styles/theme-tokyo-night.css";
import "./styles/theme-valentine.css";
import "./styles/theme-winter.css";
import { AppRouter } from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
