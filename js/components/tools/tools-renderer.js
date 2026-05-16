import tools from "../../../data/tools.js";
import { applyFilters } from "./tools-filters.js";
import { getFavorites, toggleFavorite } from "./tools-favorites.js";
import { buildToolCard, updateFavoriteButton } from "./tools-card.js";
import { renderFilterBar } from "./tools-filter-bar.js";

class ToolsRenderer {
  constructor() {
    this.container = document.getElementById("tools-grid");
    this.filterContainer = document.getElementById("filter-bar");
    this.activeFilters = {
      category: "all",
      level: "all",
      platform: "all",
      pricing: "all",
    };
    this.searchQuery = "";
  }

  renderFilters() {
    const state = {
      activeFilters: this.activeFilters,
      searchQuery: this.searchQuery,
    };

    renderFilterBar(this.filterContainer, state, {
      onSearch: (query) => {
        this.searchQuery = query.toLowerCase();
        this.render();
      },
      onFilterChange: (filterType, value) => {
        this.activeFilters[filterType] = value;
        this.render();
      },
      onClearFilters: () => {
        this.activeFilters = {
          category: "all",
          level: "all",
          platform: "all",
          pricing: "all",
        };
        this.searchQuery = "";
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = "";
        this.filterContainer.querySelectorAll(".filter-select").forEach((select) => {
          select.value = "all";
        });
        this.render();
      },
    });
  }

  render() {
    const favorites = getFavorites();
    const filtered = tools.filter((tool) => {
      if (!applyFilters(tool, this.activeFilters)) return false;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          tool.category.toLowerCase().includes(query)
        );
      }
      return true;
    });

    const countElement = document.getElementById("tools-count");
    if (countElement) {
      countElement.textContent = `${filtered.length} herramienta${filtered.length !== 1 ? "s" : ""}`;
    }

    if (filtered.length === 0) {
      this.container.innerHTML = `<div class="no-results">No se encontraron herramientas con los filtros seleccionados</div>`;
      return;
    }

    this.container.innerHTML = filtered
      .map((tool) => buildToolCard(tool, favorites.includes(tool.id)))
      .join("");

    this.container.querySelectorAll(".btn-favorite").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const { isFavorited } = toggleFavorite(id);
        updateFavoriteButton(btn, isFavorited);
      });
    });
  }

  init() {
    this.renderFilters();
    this.render();
  }
}

export { ToolsRenderer };

const toolsRendererInstance = new ToolsRenderer();
export default toolsRendererInstance;
