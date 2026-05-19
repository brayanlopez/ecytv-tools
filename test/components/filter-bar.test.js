import { describe, it, expect, beforeEach, vi } from "vitest";

describe("filter-bar", () => {
  describe("renderToolFilterBar", () => {
    let renderToolFilterBar;

    beforeEach(async () => {
      vi.resetModules();
      const module = await import("../../js/components/filter-bar.js");
      renderToolFilterBar = module.renderToolFilterBar;
    });

    it("should render filter selects with correct options", () => {
      const container = document.createElement("div");
      const state = {
        filterValues: {
          categories: ["all", "Edición"],
          levels: ["all", "beginner", "pro"],
          platforms: ["all", "windows", "mac"],
          pricings: ["all", "free", "paid"],
        },
        activeFilters: { category: "all", level: "all", platform: "all", pricing: "all" },
        searchQuery: "",
      };
      const callbacks = { onSearch: vi.fn(), onFilterChange: vi.fn(), onClearFilters: vi.fn() };

      document.body.innerHTML = '<div id="filter-bar"></div>';
      const filterBar = document.getElementById("filter-bar");

      renderToolFilterBar(filterBar, state, callbacks);

      expect(filterBar.querySelector("#search-input")).toBeTruthy();
      expect(filterBar.querySelector("#filter-category")).toBeTruthy();
      expect(filterBar.querySelector("#filter-level")).toBeTruthy();
      expect(filterBar.querySelector("#filter-platform")).toBeTruthy();
      expect(filterBar.querySelector("#filter-pricing")).toBeTruthy();
      expect(filterBar.querySelector("#clear-filters")).toBeTruthy();
      expect(filterBar.querySelector("#tools-count")).toBeTruthy();

      const catOptions = filterBar.querySelector("#filter-category").options;
      const catValues = Array.from(catOptions).map((o) => o.value);
      expect(catValues).toContain("all");
      expect(catValues).toContain("Edición");
    });

    it("should set search input value from state", () => {
      const container = document.createElement("div");
      const state = {
        filterValues: {
          categories: ["all"],
          levels: ["all"],
          platforms: ["all"],
          pricings: ["all"],
        },
        activeFilters: { category: "all", level: "all", platform: "all", pricing: "all" },
        searchQuery: "test query",
      };

      document.body.innerHTML = '<div id="filter-bar"></div>';
      renderToolFilterBar(document.getElementById("filter-bar"), state, {
        onSearch: vi.fn(),
        onFilterChange: vi.fn(),
        onClearFilters: vi.fn(),
      });

      expect(document.getElementById("search-input").value).toBe("test query");
    });

    it("should call onSearch on input event", () => {
      const container = document.createElement("div");
      const onSearch = vi.fn();
      document.body.innerHTML = '<div id="filter-bar"></div>';

      renderToolFilterBar(
        document.getElementById("filter-bar"),
        {
          filterValues: {
            categories: ["all"],
            levels: ["all"],
            platforms: ["all"],
            pricings: ["all"],
          },
          activeFilters: { category: "all", level: "all", platform: "all", pricing: "all" },
          searchQuery: "",
        },
        { onSearch, onFilterChange: vi.fn(), onClearFilters: vi.fn() },
      );

      document.getElementById("search-input").dispatchEvent(new Event("input"));
      expect(onSearch).toHaveBeenCalled();
    });

    it("should call onFilterChange on select change", () => {
      const onFilterChange = vi.fn();
      document.body.innerHTML = '<div id="filter-bar"></div>';

      renderToolFilterBar(
        document.getElementById("filter-bar"),
        {
          filterValues: {
            categories: ["all", "Edición"],
            levels: ["all"],
            platforms: ["all"],
            pricings: ["all"],
          },
          activeFilters: { category: "all", level: "all", platform: "all", pricing: "all" },
          searchQuery: "",
        },
        { onSearch: vi.fn(), onFilterChange, onClearFilters: vi.fn() },
      );

      const select = document.getElementById("filter-category");
      select.value = "Edición";
      select.dispatchEvent(new Event("change"));

      expect(onFilterChange).toHaveBeenCalledWith("category", "Edición");
    });

    it("should call onClearFilters on clear button click", () => {
      const onClearFilters = vi.fn();
      document.body.innerHTML = '<div id="filter-bar"></div>';

      renderToolFilterBar(
        document.getElementById("filter-bar"),
        {
          filterValues: {
            categories: ["all"],
            levels: ["all"],
            platforms: ["all"],
            pricings: ["all"],
          },
          activeFilters: { category: "all", level: "all", platform: "all", pricing: "all" },
          searchQuery: "",
        },
        { onSearch: vi.fn(), onFilterChange: vi.fn(), onClearFilters },
      );

      document.getElementById("clear-filters").click();
      expect(onClearFilters).toHaveBeenCalled();
    });
  });

  describe("renderDocsFilterBar", () => {
    let renderDocsFilterBar;

    beforeEach(async () => {
      vi.resetModules();
      const module = await import("../../js/components/filter-bar.js");
      renderDocsFilterBar = module.renderDocsFilterBar;
    });

    it("should render docs filter with categories", () => {
      const container = document.createElement("div");
      const onCategoryChange = vi.fn();
      document.body.innerHTML = '<div id="docs-filter-bar"></div>';

      renderDocsFilterBar(
        document.getElementById("docs-filter-bar"),
        ["all", "Guías", "Tutoriales"],
        "all",
        { onCategoryChange },
      );

      const filterBar = document.getElementById("docs-filter-bar");
      expect(filterBar.querySelector("#docs-filter-category")).toBeTruthy();
      expect(filterBar.querySelector("#docs-count")).toBeTruthy();

      const options = filterBar.querySelector("#docs-filter-category").options;
      const values = Array.from(options).map((o) => o.value);
      expect(values).toContain("all");
      expect(values).toContain("Guías");
      expect(values).toContain("Tutoriales");
    });

    it("should call onCategoryChange on select change", () => {
      const onCategoryChange = vi.fn();
      document.body.innerHTML = '<div id="docs-filter-bar"></div>';

      renderDocsFilterBar(document.getElementById("docs-filter-bar"), ["all", "Guías"], "all", {
        onCategoryChange,
      });

      const select = document.getElementById("docs-filter-category");
      select.value = "Guías";
      select.dispatchEvent(new Event("change"));

      expect(onCategoryChange).toHaveBeenCalledWith("Guías");
    });
  });
});
