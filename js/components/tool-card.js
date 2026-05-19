import tools from "../../data/tools.js";

const externalLinkIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

export function buildToolCard(tool, isFavorited) {
  const alternativesHtml =
    tool.alternatives.length > 0
      ? `
    <div class="tool-alternatives">
      <span class="alt-label">Alternativas:</span>
      ${tool.alternatives
        .map((altId) => {
          const alt = tools.find((t) => t.id === altId);
          return alt
            ? `<a href="${alt.url}" target="_blank" rel="noopener noreferrer" class="alt-link" aria-label="Ver alternativa: ${alt.name} (se abre en nueva ventana)">${alt.name}</a>`
            : "";
        })
        .join("")}
    </div>`
      : "";

  return `
    <div class="tool-card" data-id="${tool.id}">
      <div class="tool-header">
        <img src="${tool.icon}" alt="${tool.name}" class="tool-icon" onerror="this.onerror=null;this.src='assets/icons/default.svg'">
        <div class="tool-info">
          <div class="tool-name">${tool.name}</div>
          <div class="tool-category">${tool.category}</div>
        </div>
      </div>
      <p class="tool-description">${tool.description}</p>
      <div class="tool-meta">
        <span class="tool-pricing ${tool.pricing}">${tool.pricing}</span>
        <span class="tool-level ${tool.level}">${tool.level}</span>
      </div>
      <div class="tool-platforms">
        ${tool.platform.map((p) => `<span class="platform-tag">${p}</span>`).join("")}
      </div>
      <div class="tool-tags">
        ${tool.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>
      ${alternativesHtml}
      <div class="tool-footer">
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary tool-open-btn">
          Abrir${externalLinkIcon}<span class="visually-hidden">(se abre en una nueva ventana)</span>
        </a>
        <button class="btn btn-favorite ${isFavorited ? "active" : ""}" data-id="${tool.id}" aria-label="${isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}" aria-pressed="${isFavorited}">
          ${isFavorited ? "★" : "☆"}
        </button>
      </div>
    </div>
  `;
}

export function updateFavoriteButton(btn, isFavorited) {
  if (isFavorited) {
    btn.classList.add("active");
    btn.setAttribute("aria-label", "Quitar de favoritos");
    btn.setAttribute("aria-pressed", "true");
    btn.textContent = "★";
  } else {
    btn.classList.remove("active");
    btn.setAttribute("aria-label", "Añadir a favoritos");
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = "☆";
  }
}
