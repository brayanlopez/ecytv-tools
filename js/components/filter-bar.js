const PRICING_LABELS = {
  all: "Todas",
  free: "Gratis",
  freemium: "Freemium",
  paid: "Pago",
};

export function renderToolFilterBar(container, state, callbacks) {
  const { categories, levels, platforms, pricings } = state.filterValues;

  container.innerHTML = `
    <div class="search-bar">
      <input type="text" id="search-input" class="search-input" placeholder="Buscar herramientas..." value="${state.searchQuery}" aria-label="Buscar herramientas">
    </div>
    <div class="filter-row">
      <div class="filter-select-group">
        <label for="filter-category">Categoría</label>
        <select id="filter-category" class="filter-select" data-filter="category" aria-label="Filtrar por categoría">
          ${categories.map((cat) => `<option value="${cat}" ${state.activeFilters.category === cat ? "selected" : ""}>${cat === "all" ? "Todas" : cat}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label for="filter-level">Nivel</label>
        <select id="filter-level" class="filter-select" data-filter="level" aria-label="Filtrar por nivel">
          ${levels.map((lvl) => `<option value="${lvl}" ${state.activeFilters.level === lvl ? "selected" : ""}>${lvl === "all" ? "Todos" : lvl}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label for="filter-platform">Plataforma</label>
        <select id="filter-platform" class="filter-select" data-filter="platform" aria-label="Filtrar por plataforma">
          ${platforms.map((p) => `<option value="${p}" ${state.activeFilters.platform === p ? "selected" : ""}>${p === "all" ? "Todas" : p}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label for="filter-pricing">Precio</label>
        <select id="filter-pricing" class="filter-select" data-filter="pricing" aria-label="Filtrar por precio">
          ${pricings.map((p) => `<option value="${p}" ${state.activeFilters.pricing === p ? "selected" : ""}>${PRICING_LABELS[p]}</option>`).join("")}
        </select>
      </div>
      <button class="clear-filters-btn" id="clear-filters">Limpiar</button>
      <div class="tools-count" id="tools-count" aria-live="polite" aria-atomic="true"></div>
    </div>
  `;

  document.getElementById("search-input").addEventListener("input", (e) => {
    callbacks.onSearch(e.target.value);
  });

  container.querySelectorAll(".filter-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const filterType = e.target.dataset.filter;
      callbacks.onFilterChange(filterType, e.target.value);
    });
  });

  document.getElementById("clear-filters").addEventListener("click", () => {
    callbacks.onClearFilters();
  });
}

export function renderDocsFilterBar(container, categories, activeCategory, callbacks) {
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

  document.getElementById("docs-filter-category").addEventListener("change", (e) => {
    callbacks.onCategoryChange(e.target.value);
  });
}
