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

  if (activeCategory === "all") {
    const groups = new Map();
    for (const doc of filtered) {
      if (!groups.has(doc.category)) groups.set(doc.category, []);
      groups.get(doc.category).push(doc);
    }
    container.className = "docs-columns";
    container.innerHTML = [...groups.entries()]
      .map(
        ([category, items]) => `
        <div class="docs-group">
          <h3 class="docs-group-heading">${category}</h3>
          <div class="docs-group-grid">
            ${items.map(buildDocCard).join("")}
          </div>
        </div>`,
      )
      .join("");
  } else {
    container.className = "docs-grid";
    container.innerHTML = filtered.map(buildDocCard).join("");
  }
}

export function destroy() {
  container = null;
  filterContainer = null;
  activeCategory = "all";
}
