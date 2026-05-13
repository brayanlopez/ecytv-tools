import docs from "../data/docs.js";

class DocsRenderer {
  constructor() {
    this.container = document.getElementById("docs-grid");
    this.filterContainer = document.getElementById("docs-filter-bar");
    this.activeCategory = "all";
  }

  getCategories() {
    return ["all", ...new Set(docs.map((d) => d.category))];
  }

  renderFilters() {
    const categories = this.getCategories();

    this.filterContainer.innerHTML = `
      <div class="dev-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Esta sección está en desarrollo. Es posible que encuentres información incompleta o errores.</span>
      </div>
      <div class="filter-row">
        <div class="filter-select-group">
          <label for="docs-filter-category">Categoría</label>
          <select id="docs-filter-category" class="filter-select">
            ${categories.map((cat) => `<option value="${cat}">${cat === "all" ? "Todas" : cat}</option>`).join("")}
          </select>
        </div>
        <div class="docs-count" id="docs-count"></div>
      </div>
    `;

    document
      .getElementById("docs-filter-category")
      .addEventListener("change", (e) => {
        this.activeCategory = e.target.value;
        this.render();
      });
  }

  render() {
    const filtered =
      this.activeCategory === "all"
        ? docs
        : docs.filter((d) => d.category === this.activeCategory);

    document.getElementById("docs-count").textContent =
      `${filtered.length} recurso${filtered.length !== 1 ? "s" : ""}`;

    if (filtered.length === 0) {
      this.container.innerHTML = `<div class="no-results">No se encontraron recursos</div>`;
      return;
    }

    this.container.innerHTML = filtered
      .map(
        (doc) => `
      <div class="doc-card" data-id="${doc.id}">
        <div class="doc-card-header">
          <div class="doc-card-icon ${doc.type}">
            ${
              doc.type === "manual"
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
            }
          </div>
          <div class="doc-card-info">
            <div class="doc-card-name">${doc.name}</div>
            <div class="doc-card-category">${doc.category}</div>
          </div>
        </div>
        <p class="doc-card-description">${doc.description}</p>
        ${doc.manufacturer ? `<div class="doc-card-manufacturer">${doc.manufacturer}</div>` : ""}
        <a href="${doc.url}" target="_blank" rel="noopener" class="btn btn-primary">
          ${doc.type === "manual" ? "Ver Manual" : "Ver Guía"}
        </a>
      </div>
    `,
      )
      .join("");
  }

  init() {
    this.renderFilters();
    this.render();
  }
}

export { DocsRenderer };

const docsRendererInstance = new DocsRenderer();
export default docsRendererInstance;
