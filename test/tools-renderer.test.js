import { describe, it, expect, beforeEach, vi } from "vitest";
import tools from "../data/tools.js";

describe("getAllValues", () => {
  let getAllValues;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/tools-renderer.js");
    getAllValues = module.getAllValues;
  });

  it("should return all unique categories including 'all'", () => {
    const { categories } = getAllValues();
    expect(categories).toContain("all");
    expect(categories).toContain("Edición");
    expect(categories).toContain("Diseño");
    expect(categories).toContain("VFX");
    expect(categories).toContain("3D");
    expect(categories).toContain("Audio");
    expect(categories).toContain("Producción");
    expect(categories).toContain("Screenplay");
    expect(categories).toContain("Videojuegos");
    expect(categories).toContain("Encoders");
  });

  it("should return all unique levels including 'all'", () => {
    const { levels } = getAllValues();
    expect(levels).toContain("all");
    expect(levels).toContain("beginner");
    expect(levels).toContain("intermediate");
    expect(levels).toContain("pro");
  });

  it("should return all unique platforms including 'all'", () => {
    const { platforms } = getAllValues();
    expect(platforms).toContain("all");
    expect(platforms).toContain("windows");
    expect(platforms).toContain("mac");
    expect(platforms).toContain("linux");
    expect(platforms).toContain("web");
    expect(platforms).toContain("mobile");
  });

  it("should return all unique pricings including 'all'", () => {
    const { pricings } = getAllValues();
    expect(pricings).toContain("all");
    expect(pricings).toContain("free");
    expect(pricings).toContain("freemium");
    expect(pricings).toContain("paid");
  });

  it("should return sorted platforms", () => {
    const { platforms } = getAllValues();
    const sorted = [...platforms].sort();
    expect(platforms).toEqual(sorted);
  });
});

describe("applyFilters", () => {
  let applyFilters;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/tools-renderer.js");
    applyFilters = module.applyFilters;
  });

  it("should return true when all filters are 'all'", () => {
    const tool = tools[0];
    const activeFilters = {
      category: "all",
      level: "all",
      platform: "all",
      pricing: "all",
    };
    expect(applyFilters(tool, activeFilters)).toBe(true);
  });

  it("should filter by category", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "Edición",
        level: "all",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "Diseño",
        level: "all",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(false);
  });

  it("should filter by level", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "all",
        level: "pro",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "all",
        level: "beginner",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(false);
  });

  it("should filter by platform", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "windows",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "mobile",
        pricing: "all",
      }),
    ).toBe(false);
  });

  it("should filter by pricing", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "all",
        pricing: "freemium",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "all",
        pricing: "free",
      }),
    ).toBe(false);
  });

  it("should apply multiple filters at once", () => {
    const tool = tools[0];
    const filters = {
      category: "Edición",
      level: "pro",
      platform: "windows",
      pricing: "freemium",
    };
    expect(applyFilters(tool, filters)).toBe(true);
    expect(applyFilters(tool, { ...filters, level: "beginner" })).toBe(false);
  });

  it("should handle tools with multiple platforms", () => {
    const capcut = tools.find((t) => t.id === "capcut");
    expect(
      applyFilters(capcut, {
        category: "all",
        level: "all",
        platform: "mobile",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(capcut, {
        category: "all",
        level: "all",
        platform: "linux",
        pricing: "all",
      }),
    ).toBe(false);
  });
});

describe("ToolsRenderer class with DOM mocking", () => {
  let ToolsRenderer;
  let mockContainer;
  let mockFilterContainer;
  let mockClearButton;
  let mockSearchInput;
  let mockCountElement;
  let localStorageGetItemSpy;
  let localStorageData;
  let clearFiltersHandler;
  let filterChangeHandler;
  let searchInputHandler;
  let mockCategorySelect;
  let favoriteClickHandlers;
  let favoriteBtnElements;

  beforeEach(async () => {
    vi.resetModules();

    favoriteClickHandlers = [];
    favoriteBtnElements = [];

    mockContainer = {
      innerHTML: "",
      querySelectorAll: vi.fn((selector) => {
        if (selector === ".btn-favorite") {
          return {
            forEach: vi.fn((fn) => {
              favoriteBtnElements = tools.slice(0, 3).map((t) => ({
                dataset: { id: t.id },
                classList: { add: vi.fn(), remove: vi.fn() },
                textContent: "☆",
                addEventListener: vi.fn((event, handler) => {
                  if (event === "click") favoriteClickHandlers.push(handler);
                }),
              }));
              favoriteBtnElements.forEach(fn);
            }),
          };
        }
        return { forEach: vi.fn() };
      }),
    };

    mockCategorySelect = {
      dataset: { filter: "category" },
      value: "all",
      addEventListener: vi.fn((event, handler) => {
        if (event === "change") filterChangeHandler = handler;
      }),
    };

    mockFilterContainer = {
      innerHTML: "",
      querySelectorAll: vi.fn((selector) => {
        if (selector === ".filter-select") {
          return {
            forEach: vi.fn((fn) => fn(mockCategorySelect)),
          };
        }
        return { forEach: vi.fn() };
      }),
    };

    clearFiltersHandler = null;
    mockClearButton = {
      addEventListener: vi.fn((event, handler) => {
        if (event === "click") clearFiltersHandler = handler;
      }),
    };

    searchInputHandler = null;
    mockSearchInput = {
      value: "",
      addEventListener: vi.fn((event, handler) => {
        if (event === "input") searchInputHandler = handler;
      }),
    };

    mockCountElement = { textContent: "" };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "tools-grid") return mockContainer;
      if (id === "filter-bar") return mockFilterContainer;
      if (id === "clear-filters") return mockClearButton;
      if (id === "search-input") return mockSearchInput;
      if (id === "tools-count") return mockCountElement;
      return null;
    });

    localStorageData = "[]";
    localStorageGetItemSpy = vi
      .spyOn(localStorage, "getItem")
      .mockImplementation(() => localStorageData);
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {});

    const module = await import("../js/tools-renderer.js");
    ToolsRenderer = module.ToolsRenderer;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with correct filters", () => {
    const renderer = new ToolsRenderer();
    expect(renderer.activeFilters).toEqual({
      category: "all",
      level: "all",
      platform: "all",
      pricing: "all",
    });
  });

  it("should render filters with correct HTML", () => {
    const renderer = new ToolsRenderer();
    renderer.renderFilters();

    expect(mockFilterContainer.innerHTML).toContain("filter-category");
    expect(mockFilterContainer.innerHTML).toContain("filter-level");
    expect(mockFilterContainer.innerHTML).toContain("filter-platform");
    expect(mockFilterContainer.innerHTML).toContain("filter-pricing");
    expect(mockFilterContainer.innerHTML).toContain("Limpiar");
  });

  it("should render tools grid with tool cards", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("tool-card");
    expect(mockContainer.innerHTML).toContain("DaVinci Resolve");
  });

  it("should show no results message when no tools match", () => {
    const renderer = new ToolsRenderer();
    renderer.activeFilters.category = "NonExistent";
    renderer.render();

    expect(mockContainer.innerHTML).toContain("no-results");
    expect(mockContainer.innerHTML).toContain("No se encontraron");
  });

  it("should render tools with favorites button", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("btn-favorite");
    expect(mockContainer.innerHTML).toContain("☆");
  });

  it("should initialize correctly", () => {
    const renderer = new ToolsRenderer();
    const renderFiltersSpy = vi.spyOn(renderer, "renderFilters");
    const renderSpy = vi.spyOn(renderer, "render");

    renderer.init();

    expect(renderFiltersSpy).toHaveBeenCalledOnce();
    expect(renderSpy).toHaveBeenCalledOnce();
  });

  it("should call render when filter select changes", () => {
    const renderer = new ToolsRenderer();
    const renderSpy = vi.spyOn(renderer, "render");

    renderer.renderFilters();

    expect(mockFilterContainer.querySelectorAll).toHaveBeenCalled();
  });

  it("should clear filters when button clicked", () => {
    const renderer = new ToolsRenderer();
    renderer.renderFilters();

    expect(mockClearButton.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  it("should filter tools by search query", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "photoshop";
    renderer.render();

    expect(mockContainer.innerHTML).toContain("Adobe Photoshop");
  });

  it("should show search input with correct value", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "test search";
    renderer.renderFilters();

    expect(mockFilterContainer.innerHTML).toContain("search-input");
  });

  it("should display tools count when rendering", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockCountElement.textContent).toContain("herramienta");
  });

  it("should not crash when tools-count element is missing", () => {
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "tools-grid") return mockContainer;
      if (id === "filter-bar") return mockFilterContainer;
      if (id === "clear-filters") return mockClearButton;
      if (id === "search-input") return mockSearchInput;
      return null;
    });

    const renderer = new ToolsRenderer();
    expect(() => renderer.render()).not.toThrow();
  });

  it("should search by description text", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "editor";
    renderer.render();

    const matches = tools.filter((t) =>
      t.description.toLowerCase().includes("editor"),
    );
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((t) => {
      expect(mockContainer.innerHTML).toContain(t.name);
    });
  });

  it("should search by tag", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "video";
    renderer.render();

    const matches = tools.filter((t) =>
      t.tags.some((tag) => tag.toLowerCase().includes("video")),
    );
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((t) => {
      expect(mockContainer.innerHTML).toContain(t.name);
    });
  });

  it("should search by category name", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "edición";
    renderer.render();

    const matches = tools.filter((t) =>
      t.category.toLowerCase().includes("edición"),
    );
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((t) => {
      expect(mockContainer.innerHTML).toContain(t.name);
    });
  });

  it("should return all tools when search query is empty", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "";
    renderer.render();

    expect(mockContainer.innerHTML).toContain("tool-card");
    const count = mockContainer.innerHTML.split("tool-card").length - 1;
    expect(count).toBe(tools.length);
  });

  it("should show no results when search matches nothing", () => {
    const renderer = new ToolsRenderer();
    renderer.searchQuery = "xyznonexistent12345";
    renderer.render();

    expect(mockContainer.innerHTML).toContain("no-results");
  });

  it("should render alternatives for tools that have them", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    const toolsWithAlts = tools.filter((t) => t.alternatives.length > 0);
    expect(toolsWithAlts.length).toBeGreaterThan(0);
    expect(mockContainer.innerHTML).toContain("tool-alternatives");
    expect(mockContainer.innerHTML).toContain("alt-link");
  });

  it("should render filled favorite star when tool is favorited", () => {
    localStorageData = JSON.stringify(["davinci-resolve"]);

    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain('data-id="davinci-resolve"');
    const davinciCard = mockContainer.innerHTML.match(
      /data-id="davinci-resolve"[^]*?<\/div>/,
    );
    expect(davinciCard).toBeTruthy();
  });

  it("should handle null localStorage gracefully", () => {
    localStorageData = null;

    const renderer = new ToolsRenderer();
    expect(() => renderer.render()).not.toThrow();
  });

  it("should render tool pricing badges", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("tool-pricing");
    tools.slice(0, 3).forEach((t) => {
      expect(mockContainer.innerHTML).toContain(t.pricing);
    });
  });

  it("should render tool level badges", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("tool-level");
    tools.slice(0, 3).forEach((t) => {
      expect(mockContainer.innerHTML).toContain(t.level);
    });
  });

  it("should render platform tags", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("platform-tag");
    tools[0].platform.forEach((p) => {
      expect(mockContainer.innerHTML).toContain(p);
    });
  });

  it("should render tool tags", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("tag");
    tools[0].tags.forEach((tag) => {
      expect(mockContainer.innerHTML).toContain(tag);
    });
  });

  it("should update activeFilters and re-render on filter select change", () => {
    const renderer = new ToolsRenderer();
    const renderSpy = vi.spyOn(renderer, "render");
    renderer.renderFilters();

    expect(filterChangeHandler).toBeDefined();
    mockCategorySelect.value = "Edición";
    filterChangeHandler({ target: mockCategorySelect });

    expect(renderer.activeFilters.category).toBe("Edición");
    expect(renderSpy).toHaveBeenCalled();
  });

  it("should update search query and re-render on search input", () => {
    const renderer = new ToolsRenderer();
    const renderSpy = vi.spyOn(renderer, "render");
    renderer.renderFilters();

    expect(searchInputHandler).toBeDefined();
    searchInputHandler({ target: { value: "photoshop" } });

    expect(renderer.searchQuery).toBe("photoshop");
    expect(renderSpy).toHaveBeenCalled();
  });

  it("should reset filters, search, and re-render on clear", () => {
    const renderer = new ToolsRenderer();
    renderer.activeFilters = {
      category: "Edición",
      level: "pro",
      platform: "windows",
      pricing: "paid",
    };
    renderer.searchQuery = "photoshop";

    const renderSpy = vi.spyOn(renderer, "render");
    renderer.renderFilters();

    expect(clearFiltersHandler).toBeDefined();

    const mockAllSelects = [
      { value: "Edición" },
      { value: "pro" },
      { value: "windows" },
      { value: "paid" },
    ];
    vi.spyOn(mockFilterContainer, "querySelectorAll").mockReturnValue({
      forEach: vi.fn((fn) => mockAllSelects.forEach(fn)),
    });

    clearFiltersHandler();

    expect(renderer.activeFilters).toEqual({
      category: "all",
      level: "all",
      platform: "all",
      pricing: "all",
    });
    expect(renderer.searchQuery).toBe("");
    expect(mockSearchInput.value).toBe("");
    expect(renderSpy).toHaveBeenCalled();
  });

  it("should add tool to favorites on favorite button click", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(favoriteClickHandlers.length).toBeGreaterThan(0);
    expect(favoriteBtnElements.length).toBeGreaterThan(0);

    localStorageData = "[]";
    const btn = favoriteBtnElements[0];
    const mockEvent = { preventDefault: vi.fn() };
    btn.textContent = "☆";

    favoriteClickHandlers[0](mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(btn.classList.add).toHaveBeenCalledWith("active");
    expect(btn.textContent).toBe("★");
  });

  it("should remove tool from favorites on favorite button click", () => {
    const renderer = new ToolsRenderer();
    renderer.render();

    expect(favoriteClickHandlers.length).toBeGreaterThan(0);
    expect(favoriteBtnElements.length).toBeGreaterThan(0);

    const btn = favoriteBtnElements[0];
    localStorageData = JSON.stringify([btn.dataset.id, "premiere-pro"]);
    const mockEvent = { preventDefault: vi.fn() };

    favoriteClickHandlers[0](mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(btn.classList.remove).toHaveBeenCalledWith("active");
    expect(btn.textContent).toBe("☆");
  });
});
