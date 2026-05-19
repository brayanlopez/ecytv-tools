const chevronIcon = `<svg class="info-card-chevron" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

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
      ${chevronIcon}
      <span class="visually-hidden">(se abre en una nueva ventana)</span>
    </a>
  `;
}
