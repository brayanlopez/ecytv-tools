import { getDocCategories, getFilteredDocs } from "../services/docs-state.js";
import { buildDocCard } from "../components/doc-card.js";
import { renderDocsFilterBar } from "../components/filter-bar.js";

let container = null;
let filterContainer = null;
let activeCategory = "all";

export function init() {
  container = document.getElementById("docs-grid");
  filterContainer = document.getElementById("docs-filter-bar");

  renderFilters();
  render();
}

function renderFilters() {
  const categories = getDocCategories();
  renderDocsFilterBar(filterContainer, categories, activeCategory, {
    onCategoryChange: (value) => {
      activeCategory = value;
      render();
    },
  });
}

function render() {
  const filtered = getFilteredDocs(activeCategory);

  const countEl = document.getElementById("docs-count");
  countEl.textContent = `${filtered.length} recurso${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="no-results" role="status">No se encontraron recursos</div>`;
    return;
  }

  container.innerHTML = filtered.map(buildDocCard).join("");
}

export function destroy() {
  container = null;
  filterContainer = null;
  activeCategory = "all";
}
