import tools from "../data/tools.js";

export function getAllValues() {
  const categories = ["all", ...new Set(tools.map((t) => t.category))];
  const levels = ["all", ...new Set(tools.map((t) => t.level))];
  const platforms = [
    "all",
    ...new Set(tools.flatMap((t) => t.platform)),
  ].sort();
  const pricings = ["all", ...new Set(tools.map((t) => t.pricing))];
  return { categories, levels, platforms, pricings };
}

export function applyFilters(tool, activeFilters) {
  const { category, level, platform, pricing } = activeFilters;

  if (category !== "all" && tool.category !== category) return false;
  if (level !== "all" && tool.level !== level) return false;
  if (platform !== "all" && !tool.platform.includes(platform)) return false;
  if (pricing !== "all" && tool.pricing !== pricing) return false;

  return true;
}

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
  }

  renderFilters() {
    const { categories, levels, platforms, pricings } = getAllValues();
    const pricingLabels = {
      all: "Todas",
      free: "Gratis",
      freemium: "Freemium",
      paid: "Pago",
    };

    this.filterContainer.innerHTML = `
      <div class="filter-row">
        <div class="filter-select-group">
          <label for="filter-category">Categoría</label>
          <select id="filter-category" class="filter-select" data-filter="category">
            ${categories.map((cat) => `<option value="${cat}">${cat === "all" ? "Todas" : cat}</option>`).join("")}
          </select>
        </div>
        <div class="filter-select-group">
          <label for="filter-level">Nivel</label>
          <select id="filter-level" class="filter-select" data-filter="level">
            ${levels.map((lvl) => `<option value="${lvl}">${lvl === "all" ? "Todos" : lvl}</option>`).join("")}
          </select>
        </div>
        <div class="filter-select-group">
          <label for="filter-platform">Plataforma</label>
          <select id="filter-platform" class="filter-select" data-filter="platform">
            ${platforms.map((p) => `<option value="${p}">${p === "all" ? "Todas" : p}</option>`).join("")}
          </select>
        </div>
        <div class="filter-select-group">
          <label for="filter-pricing">Precio</label>
          <select id="filter-pricing" class="filter-select" data-filter="pricing">
            ${pricings.map((p) => `<option value="${p}">${pricingLabels[p]}</option>`).join("")}
          </select>
        </div>
        <button class="clear-filters-btn" id="clear-filters">Limpiar</button>
      </div>
    `;

    this.filterContainer
      .querySelectorAll(".filter-select")
      .forEach((select) => {
        select.addEventListener("change", (e) => {
          const filterType = e.target.dataset.filter;
          this.activeFilters[filterType] = e.target.value;
          this.render();
        });
      });

    document.getElementById("clear-filters").addEventListener("click", () => {
      this.activeFilters = {
        category: "all",
        level: "all",
        platform: "all",
        pricing: "all",
      };
      this.filterContainer
        .querySelectorAll(".filter-select")
        .forEach((select) => {
          select.value = "all";
        });
      this.render();
    });
  }

  render() {
    const favorites = JSON.parse(
      localStorage.getItem("ecytv_favorites") || "[]",
    );
    const filtered = tools.filter((tool) =>
      applyFilters(tool, this.activeFilters),
    );

    if (filtered.length === 0) {
      this.container.innerHTML = `<div class="no-results">No se encontraron herramientas con los filtros seleccionados</div>`;
      return;
    }

    this.container.innerHTML = filtered
      .map(
        (tool) => `
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
        ${
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
            : ""
        }
        <div class="tool-footer">
          <a href="${tool.url}" target="_blank" rel="noopener" class="btn btn-primary">Abrir</a>
          <button class="btn btn-favorite ${favorites.includes(tool.id) ? "active" : ""}" data-id="${tool.id}">
            ${favorites.includes(tool.id) ? "★" : "☆"}
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    this.container.querySelectorAll(".btn-favorite").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const favorites = JSON.parse(
          localStorage.getItem("ecytv_favorites") || "[]",
        );
        const idx = favorites.indexOf(id);
        if (idx > -1) {
          favorites.splice(idx, 1);
          btn.classList.remove("active");
          btn.textContent = "☆";
        } else {
          favorites.push(id);
          btn.classList.add("active");
          btn.textContent = "★";
        }
        localStorage.setItem("ecytv_favorites", JSON.stringify(favorites));
      });
    });
  }

  init() {
    this.renderFilters();
    this.render();
  }
}

// Export the class for testing
export { ToolsRenderer };

// Create and export instance for app.js
const toolsRendererInstance = new ToolsRenderer();
export default toolsRendererInstance;
