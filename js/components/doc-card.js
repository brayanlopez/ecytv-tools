const externalLinkIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

export function buildDocCard(doc) {
  const isExternal = doc.url !== "#";
  const actionLabel = doc.type === "manual" ? "Ver Manual" : "Ver Guía";
  const typeLabel = doc.type === "manual" ? "Manual" : "Guía";

  return `
    <div class="doc-card" data-id="${doc.id}">
      <div class="doc-card-header">
        <div class="doc-card-icon ${doc.type}">
          ${
            doc.type === "manual"
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
          }
        </div>
        <div class="doc-card-info">
          <div class="doc-card-name">${doc.name}</div>
          <div class="doc-card-meta">
            <span class="doc-card-type ${doc.type}">${typeLabel}</span>
            ${doc.manufacturer ? `<span class="doc-card-manufacturer">${doc.manufacturer}</span>` : ""}
          </div>
        </div>
      </div>
      <p class="doc-card-description">${doc.description}</p>
      <a href="${doc.url}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""} class="btn btn-primary doc-card-btn">
        ${actionLabel}${isExternal ? externalLinkIcon : ""}
        ${isExternal ? '<span class="visually-hidden">(se abre en una nueva ventana)</span>' : ""}
      </a>
    </div>
  `;
}
