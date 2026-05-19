import { buildInfoCard } from "../components/info-card.js";
import infoCards from "../../data/info-cards.js";

export function init() {
  const container = document.getElementById("info-card-list");
  if (!container) return;
  container.innerHTML = infoCards.map(buildInfoCard).join("");
}

export function destroy() {}
