import { EXTERNAL_LINK_ICON_LG } from "./icons.js";

export function buildInfoCard(card) {
  return `
    <a href="${card.url}" target="_blank" rel="noopener noreferrer" class="info-card">
      <div class="info-card-header">
        <div class="info-card-icon">${card.icon.replace("<svg", '<svg aria-hidden="true"')}</div>
        <div class="info-card-body">
          <span class="info-card-title">${card.title}</span>
          <span class="info-card-desc">${card.description}</span>
        </div>
      </div>
      ${EXTERNAL_LINK_ICON_LG}
      <span class="visually-hidden">(se abre en una nueva ventana)</span>
    </a>
  `;
}
