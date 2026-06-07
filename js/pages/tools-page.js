import {
  getFavorites,
  toggleFavorite,
  getAllValues,
  getFilteredTools,
} from "../services/tools-state.js";
import { buildToolCard, updateFavoriteButton } from "../components/tool-card.js";
import { renderToolFilterBar } from "../components/filter-bar.js";

let filterContainer = null;
let container = null;
let activeFilters = null;
let searchQuery = "";

export function init() {
  container = document.getElementById("tools-grid");
  filterContainer = document.getElementById("filter-bar");
  activeFilters = {
    category: "all",
    level: "all",
    platform: "all",
    pricing: "all",
  };
  searchQuery = "";

  renderFilters();
  render();
}

function renderFilters() {
  const filterValues = getAllValues();
  const state = { activeFilters, searchQuery, filterValues };

  renderToolFilterBar(filterContainer, state, {
    onSearch: (query) => {
      searchQuery = query.toLowerCase();
      render();
    },
    onFilterChange: (filterType, value) => {
      activeFilters[filterType] = value;
      render();
    },
    onClearFilters: () => {
      activeFilters = {
        category: "all",
        level: "all",
        platform: "all",
        pricing: "all",
      };
      searchQuery = "";
      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.value = "";
      }
      filterContainer.querySelectorAll(".filter-select").forEach((select) => {
        select.value = "all";
      });
      render();
    },
  });
}

function isDefaultFilters() {
  return (
    searchQuery === "" &&
    activeFilters.category === "all" &&
    activeFilters.level === "all" &&
    activeFilters.platform === "all" &&
    activeFilters.pricing === "all"
  );
}

function render() {
  const favorites = getFavorites();
  const filtered = getFilteredTools(activeFilters, searchQuery);

  const countElement = document.getElementById("tools-count");
  if (countElement) {
    countElement.textContent = `${filtered.length} herramienta${filtered.length !== 1 ? "s" : ""}`;
  }

  if (filtered.length === 0) {
    container.className = "tools-grid";
    container.innerHTML = `<div class="no-results" role="status">No se encontraron herramientas con los filtros seleccionados</div>`;
    return;
  }

  if (isDefaultFilters()) {
    const groups = new Map();
    for (const tool of filtered) {
      if (!groups.has(tool.category)) {
        groups.set(tool.category, []);
      }
      groups.get(tool.category).push(tool);
    }
    container.className = "tools-columns";
    container.innerHTML = [...groups.entries()]
      .map(
        ([category, items]) => `
        <div class="tools-group">
          <h3 class="tools-group-heading">${category}</h3>
          <div class="tools-group-grid">
            ${items.map((tool) => buildToolCard(tool, favorites.includes(tool.id))).join("")}
          </div>
        </div>`,
      )
      .join("");
  } else {
    container.className = "tools-grid";
    container.innerHTML = filtered
      .map((tool) => buildToolCard(tool, favorites.includes(tool.id)))
      .join("");
  }

  container.querySelectorAll(".btn-favorite").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const { isFavorited } = toggleFavorite(id);
      updateFavoriteButton(btn, isFavorited);
    });
  });
}

export function destroy() {
  container = null;
  filterContainer = null;
  activeFilters = null;
  searchQuery = "";
}
