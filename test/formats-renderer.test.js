import { describe, it, expect, beforeEach, vi } from "vitest";
import formats from "../data/formats.js";

describe("renderFormats", () => {
  let renderFormats;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/components/formats-renderer.js");
    renderFormats = module.renderFormats;
  });

  it("should do nothing when container does not exist", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    expect(() => renderFormats()).not.toThrow();
  });

  it("should render all formats into the container", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    renderFormats();

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

    renderFormats();

    expect(container.innerHTML).toContain("format-card");
    expect(container.innerHTML).toContain("format-card-header");
    expect(container.innerHTML).toContain("format-card-icon");
    expect(container.innerHTML).toContain("btn-primary");
  });

  it("should add coming-soon class for unavailable formats", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    renderFormats();

    expect(container.innerHTML).toContain("coming-soon");
    const unavailable = formats.filter((f) => !f.available);
    unavailable.forEach((f) => {
      expect(container.innerHTML).toContain("btn-disabled");
      expect(container.innerHTML).toContain(f.label);
    });
  });

  it("should render SVG icons", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "formats-grid") return container;
      return null;
    });

    renderFormats();

    formats.forEach((f) => {
      expect(container.innerHTML).toContain(f.icon);
    });
  });
});
