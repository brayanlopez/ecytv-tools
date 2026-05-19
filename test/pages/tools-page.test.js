import { describe, it, expect, beforeEach, vi } from "vitest";

const mockTools = [
  {
    id: "tool1",
    name: "Tool 1",
    category: "Edición",
    platform: ["windows"],
    tags: [],
    alternatives: [],
    url: "#",
    icon: "",
    pricing: "free",
    level: "beginner",
    description: "Desc",
  },
  {
    id: "tool2",
    name: "Tool 2",
    category: "Audio",
    platform: ["mac"],
    tags: [],
    alternatives: [],
    url: "#",
    icon: "",
    pricing: "paid",
    level: "pro",
    description: "Desc 2",
  },
];

vi.mock("../../js/services/tools-state.js", () => ({
  getFavorites: vi.fn(() => []),
  toggleFavorite: vi.fn((id) => ({ isFavorited: true })),
  getAllValues: vi.fn(() => ({
    categories: ["all", "Edición", "Audio"],
    levels: ["all", "beginner", "pro"],
    platforms: ["all", "windows", "mac"],
    pricings: ["all", "free", "paid"],
  })),
  getFilteredTools: vi.fn((filters, query) => {
    if (filters.category === "non-existent" || query === "__no_results__") return [];
    if (filters.category !== "all") return mockTools.filter((t) => t.category === filters.category);
    return mockTools;
  }),
}));

vi.mock("../../js/components/tool-card.js", () => ({
  buildToolCard: vi.fn(
    (tool, isFav) =>
      `<div class="tool-card" data-id="${tool.id}"><button class="btn-favorite" data-id="${tool.id}">${isFav ? "★" : "☆"}</button></div>`,
  ),
  updateFavoriteButton: vi.fn(),
}));

vi.mock("../../js/components/filter-bar.js", () => ({
  renderToolFilterBar: vi.fn((container, state, callbacks) => {
    container.innerHTML = `<input id="search-input" /><div id="tools-count"></div>`;
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => callbacks.onSearch(e.target.value));
  }),
}));

describe("tools-page", () => {
  let init, destroy;

  beforeEach(async () => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <div id="tools-grid"></div>
      <div id="filter-bar"></div>
    `;
    vi.resetModules();
    const module = await import("../../js/pages/tools-page.js");
    init = module.init;
    destroy = module.destroy;
  });

  it("should render tool cards on init", () => {
    init();
    const grid = document.getElementById("tools-grid");
    expect(grid.innerHTML).toContain("tool-card");
    expect(grid.children.length).toBe(2);
  });

  it("should show no results message when filtered list is empty", () => {
    init();
    const searchInput = document.getElementById("search-input");
    searchInput.value = "__no_results__";
    searchInput.dispatchEvent(new Event("input"));
    const grid = document.getElementById("tools-grid");
    expect(grid.innerHTML).toContain("No se encontraron herramientas");
  });

  it("should update count element with number of results", () => {
    init();
    const countEl = document.getElementById("tools-count");
    expect(countEl.textContent).toContain("2");
  });

  it("should call renderToolFilterBar with state on init", async () => {
    const { renderToolFilterBar } = await import("../../js/components/filter-bar.js");
    init();
    expect(renderToolFilterBar).toHaveBeenCalled();
    const call = renderToolFilterBar.mock.calls[0];
    expect(call[1].activeFilters).toEqual({
      category: "all",
      level: "all",
      platform: "all",
      pricing: "all",
    });
  });

  it("should not throw on destroy", () => {
    expect(() => destroy()).not.toThrow();
  });

  it("should call destroy without crashing when called twice", () => {
    destroy();
    expect(() => destroy()).not.toThrow();
  });

  it("should clear filters and re-render on onClearFilters", async () => {
    init();
    const grid = document.getElementById("tools-grid");
    expect(grid.children.length).toBe(2);

    const mod = await import("../../js/components/filter-bar.js");
    const callbacks = mod.renderToolFilterBar.mock.calls[0][2];
    callbacks.onClearFilters();

    expect(grid.children.length).toBe(2);
  });

  it("should toggle favorite on button click and update button", async () => {
    init();
    const grid = document.getElementById("tools-grid");
    const favBtn = grid.querySelector(".btn-favorite");
    expect(favBtn).toBeTruthy();

    const stateMod = await import("../../js/services/tools-state.js");
    const cardMod = await import("../../js/components/tool-card.js");

    favBtn.click();

    expect(stateMod.toggleFavorite).toHaveBeenCalledWith("tool1");
    expect(cardMod.updateFavoriteButton).toHaveBeenCalled();
  });

  it("should set search query and re-render on search", () => {
    init();
    const searchInput = document.getElementById("search-input");
    searchInput.value = "tool";
    searchInput.dispatchEvent(new Event("input"));

    const grid = document.getElementById("tools-grid");
    expect(grid.children.length).toBe(2);
  });
});
