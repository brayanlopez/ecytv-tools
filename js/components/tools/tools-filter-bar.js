import { getAllValues } from "./tools-filters.js";

const PRICING_LABELS = {
  all: "Todas",
  free: "Gratis",
  freemium: "Freemium",
  paid: "Pago",
};

export function renderFilterBar(container, state, callbacks) {
  const { categories, levels, platforms, pricings } = getAllValues();

  container.innerHTML = `
    <div class="search-bar">
      <input type="text" id="search-input" class="search-input" placeholder="Buscar herramientas..." value="${state.searchQuery}">
    </div>
    <div class="filter-row">
      <div class="filter-select-group">
        <label for="filter-category">Categoría</label>
        <select id="filter-category" class="filter-select" data-filter="category">
          ${categories.map((cat) => `<option value="${cat}" ${state.activeFilters.category === cat ? "selected" : ""}>${cat === "all" ? "Todas" : cat}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label for="filter-level">Nivel</label>
        <select id="filter-level" class="filter-select" data-filter="level">
          ${levels.map((lvl) => `<option value="${lvl}" ${state.activeFilters.level === lvl ? "selected" : ""}>${lvl === "all" ? "Todos" : lvl}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label for="filter-platform">Plataforma</label>
        <select id="filter-platform" class="filter-select" data-filter="platform">
          ${platforms.map((p) => `<option value="${p}" ${state.activeFilters.platform === p ? "selected" : ""}>${p === "all" ? "Todas" : p}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label for="filter-pricing">Precio</label>
        <select id="filter-pricing" class="filter-select" data-filter="pricing">
          ${pricings.map((p) => `<option value="${p}" ${state.activeFilters.pricing === p ? "selected" : ""}>${PRICING_LABELS[p]}</option>`).join("")}
        </select>
      </div>
      <button class="clear-filters-btn" id="clear-filters">Limpiar</button>
      <div class="tools-count" id="tools-count"></div>
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
