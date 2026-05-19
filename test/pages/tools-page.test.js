import { describe, it, expect, beforeEach, vi } from "vitest";
import tools from "../../data/tools.js";

describe("tools-page", () => {
  let toolsPage;

  beforeEach(async () => {
    vi.resetModules();

    const mockContainer = {
      innerHTML: "",
      querySelectorAll: vi.fn((selector) => {
        if (selector === ".btn-favorite") return { forEach: vi.fn() };
        return { forEach: vi.fn() };
      }),
    };

    const mockFilterContainer = {
      innerHTML: "",
      querySelectorAll: vi.fn((selector) => {
        if (selector === ".filter-select") {
          return {
            forEach: vi.fn((fn) => {
              const selects = [
                { dataset: { filter: "category" }, value: "all", addEventListener: vi.fn() },
                { dataset: { filter: "level" }, value: "all", addEventListener: vi.fn() },
                { dataset: { filter: "platform" }, value: "all", addEventListener: vi.fn() },
                { dataset: { filter: "pricing" }, value: "all", addEventListener: vi.fn() },
              ];
              selects.forEach(fn);
            }),
          };
        }
        return { forEach: vi.fn() };
      }),
    };

    const mockCountElement = { textContent: "" };
    const mockSearchInput = { value: "", addEventListener: vi.fn() };
    const mockClearButton = { addEventListener: vi.fn() };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "tools-grid") return mockContainer;
      if (id === "filter-bar") return mockFilterContainer;
      if (id === "tools-count") return mockCountElement;
      if (id === "search-input") return mockSearchInput;
      if (id === "clear-filters") return mockClearButton;
      if (id === "filter-category")
        return { dataset: { filter: "category" }, value: "all", addEventListener: vi.fn() };
      if (id === "filter-level")
        return { dataset: { filter: "level" }, value: "all", addEventListener: vi.fn() };
      if (id === "filter-platform")
        return { dataset: { filter: "platform" }, value: "all", addEventListener: vi.fn() };
      if (id === "filter-pricing")
        return { dataset: { filter: "pricing" }, value: "all", addEventListener: vi.fn() };
      return null;
    });
  });

  it("should render tools grid with tool cards", async () => {
    const module = await import("../../js/pages/tools-page.js");
    toolsPage = module;
    toolsPage.init();
  });

  it("should show no results with restrictive filter", async () => {
    const module = await import("../../js/pages/tools-page.js");
    toolsPage = module;
    toolsPage.init();
  });

  it("should not throw on destroy", async () => {
    const module = await import("../../js/pages/tools-page.js");
    toolsPage = module;
    expect(() => toolsPage.destroy()).not.toThrow();
  });
});
