import { buildFormatSection } from "../components/format-card.js";
import formats from "../../data/formats.js";

export function init() {
  const container = document.getElementById("formats-grid");
  if (!container) {
    return;
  }

  const forms = formats.filter((f) => f.type === "form");
  const tools = formats.filter((f) => f.type === "tool");

  container.innerHTML =
    buildFormatSection("Generar Formatos", forms) +
    buildFormatSection("Herramientas Útiles", tools);
}

export function destroy() {}
