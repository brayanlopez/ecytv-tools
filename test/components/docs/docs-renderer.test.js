import { describe, it, expect, beforeEach, vi } from "vitest";
import docs from "../../../data/docs.js";

describe("DocsRenderer", () => {
  let DocsRenderer;
  let mockContainer;
  let mockFilterContainer;
  let mockCountElement;
  let mockSelect;

  beforeEach(async () => {
    vi.resetModules();

    mockContainer = { innerHTML: "" };
    mockFilterContainer = { innerHTML: "" };
    mockCountElement = { textContent: "" };
    mockSelect = {
      value: "all",
      addEventListener: vi.fn(),
    };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "docs-grid") return mockContainer;
      if (id === "docs-filter-bar") return mockFilterContainer;
      if (id === "docs-count") return mockCountElement;
      if (id === "docs-filter-category") return mockSelect;
      return null;
    });

    const module = await import("../../../js/components/docs/docs-renderer.js");
    DocsRenderer = module.DocsRenderer;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with correct defaults", () => {
    const renderer = new DocsRenderer();
    expect(renderer.activeCategory).toBe("all");
    expect(renderer.container).toBe(mockContainer);
    expect(renderer.filterContainer).toBe(mockFilterContainer);
  });

  it("should return categories including 'all'", () => {
    const renderer = new DocsRenderer();
    const categories = renderer.getCategories();
    expect(categories).toContain("all");
    const uniqueCategories = [...new Set(docs.map((d) => d.category))];
    uniqueCategories.forEach((cat) => {
      expect(categories).toContain(cat);
    });
  });

  it("should render filters", () => {
    const renderer = new DocsRenderer();
    renderer.renderFilters();

    expect(mockFilterContainer.innerHTML).toContain("docs-filter-category");
    expect(mockFilterContainer.innerHTML).toContain("Todas");
    expect(mockFilterContainer.innerHTML).toContain("docs-count");
  });

  it("should render all docs when activeCategory is 'all'", () => {
    const renderer = new DocsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("doc-card");
    expect(mockContainer.innerHTML).toContain("Sony PXW-FS7");
    expect(mockContainer.innerHTML).toContain("Protocolo de Préstamo");
  });

  it("should filter docs by category", () => {
    const renderer = new DocsRenderer();
    renderer.activeCategory = "Equipos de iluminación";
    renderer.render();

    expect(mockContainer.innerHTML).toContain("ARRI Compact 650W");
    expect(mockContainer.innerHTML).not.toContain("Sony PXW-FS7");
  });

  it("should show no results message for empty category", () => {
    const renderer = new DocsRenderer();
    renderer.activeCategory = "NonExistent";
    renderer.render();

    expect(mockContainer.innerHTML).toContain("no-results");
    expect(mockContainer.innerHTML).toContain("No se encontraron recursos");
  });

  it("should render doc cards with correct structure", () => {
    const renderer = new DocsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("doc-card-header");
    expect(mockContainer.innerHTML).toContain("doc-card-icon");
    expect(mockContainer.innerHTML).toContain("doc-card-name");
    expect(mockContainer.innerHTML).toContain("doc-card-category");
    expect(mockContainer.innerHTML).toContain("doc-card-description");
    expect(mockContainer.innerHTML).toContain("btn-primary");
  });

  it("should render manual icon for manual type", () => {
    const renderer = new DocsRenderer();
    renderer.render();

    const manual = docs.find((d) => d.type === "manual");
    expect(mockContainer.innerHTML).toContain(`data-id="${manual.id}"`);
    expect(mockContainer.innerHTML).toContain("Ver Manual");
  });

  it("should render guide icon for guide type", () => {
    const renderer = new DocsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("Ver Guía");
  });

  it("should conditionally render manufacturer", () => {
    const renderer = new DocsRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("Sony");
    expect(mockContainer.innerHTML).toContain("doc-card-manufacturer");
  });

  it("should update docs count when rendering", () => {
    const renderer = new DocsRenderer();
    renderer.activeCategory = "all";
    renderer.render();
    expect(mockCountElement.textContent).toContain("recurso");

    renderer.activeCategory = "NonExistent";
    renderer.render();
    expect(mockCountElement.textContent).toContain("0 recursos");
  });

  it("should attach change event to filter select", () => {
    const renderer = new DocsRenderer();
    renderer.renderFilters();

    expect(mockSelect.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("should filter by category when select changes", () => {
    const renderer = new DocsRenderer();
    const renderSpy = vi.spyOn(renderer, "render");

    let changeHandler;
    mockSelect.addEventListener = vi.fn((event, handler) => {
      if (event === "change") changeHandler = handler;
    });
    renderer.renderFilters();

    expect(changeHandler).toBeDefined();
    changeHandler({ target: { value: "Equipos de iluminación" } });

    expect(renderer.activeCategory).toBe("Equipos de iluminación");
    expect(renderSpy).toHaveBeenCalled();
  });

  it("should call renderFilters and render on init", () => {
    const renderer = new DocsRenderer();
    const renderFiltersSpy = vi.spyOn(renderer, "renderFilters");
    const renderSpy = vi.spyOn(renderer, "render");

    renderer.init();

    expect(renderFiltersSpy).toHaveBeenCalledOnce();
    expect(renderSpy).toHaveBeenCalledOnce();
  });
});
