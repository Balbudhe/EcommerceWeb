import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FONT } from "./data/site";
import "./index.css";
import "./styles/shared.css";
import App from "./App.jsx";

const rootStyles = document.documentElement.style;
rootStyles.setProperty("--font-display", FONT.stack);
rootStyles.setProperty("--font-body", FONT.stack);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
