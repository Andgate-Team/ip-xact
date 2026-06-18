import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./lib/cytoscape/setup";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
