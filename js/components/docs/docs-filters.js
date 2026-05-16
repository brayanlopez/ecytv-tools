import docs from "../../../data/docs.js";

export function getDocCategories() {
  return ["all", ...new Set(docs.map((d) => d.category))];
}

export function renderDocsFilterBar(container, activeCategory, callbacks) {
  const categories = getDocCategories();

  container.innerHTML = `
    <div class="dev-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>Esta sección está en desarrollo. Es posible que encuentres información incompleta o errores.</span>
    </div>
    <div class="filter-row">
      <div class="filter-select-group">
        <label for="docs-filter-category">Categoría</label>
        <select id="docs-filter-category" class="filter-select" aria-label="Filtrar por categoría">
          ${categories.map((cat) => `<option value="${cat}" ${activeCategory === cat ? "selected" : ""}>${cat === "all" ? "Todas" : cat}</option>`).join("")}
        </select>
      </div>
      <div class="docs-count" id="docs-count" aria-live="polite" aria-atomic="true"></div>
    </div>
  `;

  document
    .getElementById("docs-filter-category")
    .addEventListener("change", (e) => {
      callbacks.onCategoryChange(e.target.value);
    });
}
