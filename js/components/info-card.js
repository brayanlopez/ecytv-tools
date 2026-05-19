export function buildInfoCard(card) {
  return `
    <div class="info-card">
      <div class="info-card-header">
        <div class="info-card-icon">${card.icon.replace("<svg", '<svg aria-hidden="true"')}</div>
        <h3>${card.title}</h3>
      </div>
      <p>${card.description}</p>
      <a href="${card.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${card.label}<span class="visually-hidden">(se abre en una nueva ventana)</span></a>
    </div>
  `;
}
