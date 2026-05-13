import infoCards from "../data/info-cards.js";

export function renderInfoCards() {
  const container = document.getElementById("info-card-list");
  if (!container) return;

  container.innerHTML = infoCards
    .map(
      (card) => `
    <div class="info-card">
      <div class="info-card-header">
        <div class="info-card-icon">${card.icon}</div>
        <h3>${card.title}</h3>
      </div>
      <p>${card.description}</p>
      <a href="${card.url}" target="_blank" class="btn btn-primary">${card.label}</a>
    </div>
  `,
    )
    .join("");
}
