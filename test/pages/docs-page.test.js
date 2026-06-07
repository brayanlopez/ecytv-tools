import { describe, it, expect, beforeEach, vi } from "vitest";
describe("docs-page", () => {
  let docsPage;

  beforeEach(async () => {
    vi.resetModules();

    const mockContainer = { innerHTML: "" };
    const mockFilterContainer = { innerHTML: "" };
    const mockCountElement = { textContent: "" };
    const mockSelect = { value: "all", addEventListener: vi.fn() };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "docs-grid") {
        return mockContainer;
      }
      if (id === "docs-filter-bar") {
        return mockFilterContainer;
      }
      if (id === "docs-count") {
        return mockCountElement;
      }
      if (id === "docs-filter-category") {
        return mockSelect;
      }
      return null;
    });
  });

  it("should render doc cards", async () => {
    const module = await import("../../js/pages/docs-page.js");
    docsPage = module;
    docsPage.init();
  });

  it("should not throw on destroy", async () => {
    const module = await import("../../js/pages/docs-page.js");
    docsPage = module;
    expect(() => docsPage.destroy()).not.toThrow();
  });

  it("should filter docs when filter changes", async () => {
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "docs-grid") {
        return { innerHTML: "" };
      }
      if (id === "docs-filter-bar") {
        return { innerHTML: "", querySelectorAll: vi.fn().mockReturnValue({ forEach: vi.fn() }) };
      }
      if (id === "docs-count") {
        return { textContent: "" };
      }
      if (id === "docs-filter-category") {
        return {
          value: "all",
          addEventListener: vi.fn(),
        };
      }
      return null;
    });

    const module = await import("../../js/pages/docs-page.js");
    docsPage = module;
    docsPage.init();
  });
});
