import tools from "../../../data/tools.js";

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
            ? `<a href="${alt.url}" target="_blank" class="alt-link">${alt.name}</a>`
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
        <a href="${tool.url}" target="_blank" rel="noopener" class="btn btn-primary">Abrir</a>
        <button class="btn btn-favorite ${isFavorited ? "active" : ""}" data-id="${tool.id}">
          ${isFavorited ? "★" : "☆"}
        </button>
      </div>
    </div>
  `;
}

export function updateFavoriteButton(btn, isFavorited) {
  if (isFavorited) {
    btn.classList.add("active");
    btn.textContent = "★";
  } else {
    btn.classList.remove("active");
    btn.textContent = "☆";
  }
}
