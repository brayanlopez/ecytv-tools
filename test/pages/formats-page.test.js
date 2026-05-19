import { describe, it, expect, beforeEach, vi } from "vitest";
import formats from "../../data/formats.js";

describe("formats-page", () => {
  let formatsPage;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/pages/formats-page.js");
    formatsPage = module;
  });

  it("should do nothing when container does not exist", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    expect(() => formatsPage.init()).not.toThrow();
  });

  it("should render all formats into the container", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    formatsPage.init();

    formats.forEach((f) => {
      expect(container.innerHTML).toContain(f.name);
      expect(container.innerHTML).toContain(f.description);
    });
  });

  it("should render format cards with correct structure", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    formatsPage.init();

    expect(container.innerHTML).toContain("format-card");
    expect(container.innerHTML).toContain("format-card-header");
  });

  it("should render a subheading for forms and tools", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    formatsPage.init();

    expect(container.innerHTML).toContain("Generar Formatos");
    expect(container.innerHTML).toContain("Herramientas Útiles");
  });

  it("should place form items under Generar Formatos section", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    formatsPage.init();

    const forms = formats.filter((f) => f.type === "form");
    const toolItems = formats.filter((f) => f.type === "tool");
    const splitIndex = container.innerHTML.indexOf("Herramientas Útiles");

    forms.forEach((f) => {
      expect(container.innerHTML.indexOf(f.name)).toBeLessThan(splitIndex);
    });
    toolItems.forEach((f) => {
      expect(container.innerHTML.indexOf(f.name)).toBeGreaterThan(splitIndex);
    });
  });

  it("should not throw on destroy", () => {
    expect(() => formatsPage.destroy()).not.toThrow();
  });
});
