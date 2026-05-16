import { describe, it, expect, beforeEach, vi } from "vitest";
import infoCards from "../../data/info-cards.js";

describe("renderInfoCards", () => {
  let renderInfoCards;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/components/info-renderer.js");
    renderInfoCards = module.renderInfoCards;
  });

  it("should do nothing when container does not exist", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    expect(() => renderInfoCards()).not.toThrow();
  });

  it("should render all cards into the container", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "info-card-list") return container;
      return null;
    });

    renderInfoCards();

    expect(container.innerHTML).toContain(
      "Programación de Recursos - Lab Postproducción",
    );
    expect(container.innerHTML).toContain(
      "Programación de Recursos - Lab Instrumentos",
    );
    expect(container.innerHTML).toContain(
      "Base de datos Casting general de la Escuela",
    );
  });

  it("should render info-card elements", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "info-card-list") return container;
      return null;
    });

    renderInfoCards();

    expect(container.innerHTML).toContain("info-card");
    expect(container.innerHTML).toContain("info-card-header");
    expect(container.innerHTML).toContain("info-card-icon");
    expect(container.innerHTML).toContain("btn-primary");
  });

  it("should render links with correct URLs", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "info-card-list") return container;
      return null;
    });

    renderInfoCards();

    infoCards.forEach((card) => {
      expect(container.innerHTML).toContain(card.url);
      expect(container.innerHTML).toContain(card.label);
    });
  });

  it("should render SVG icons with aria-hidden", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "info-card-list") return container;
      return null;
    });

    renderInfoCards();

    infoCards.forEach((card) => {
      expect(container.innerHTML).toContain('aria-hidden="true"');
    });
    expect(container.innerHTML).toContain("info-card-icon");
  });
});
