import { describe, it, expect, beforeEach, vi } from "vitest";
import infoCards from "../../data/info-cards.js";

describe("info-page", () => {
  let infoPage;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/pages/info-page.js");
    infoPage = module;
  });

  it("should do nothing when container does not exist", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    expect(() => infoPage.init()).not.toThrow();
  });

  it("should render all cards into the container", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "info-card-list") {
        return container;
      }
      return null;
    });

    infoPage.init();

    infoCards.forEach((card) => {
      expect(container.innerHTML).toContain(card.title);
      expect(container.innerHTML).toContain(card.description);
    });
  });

  it("should render info-card elements", () => {
    const container = { innerHTML: "" };
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "info-card-list") {
        return container;
      }
      return null;
    });

    infoPage.init();

    expect(container.innerHTML).toContain("info-card");
    expect(container.innerHTML).toContain("info-card-header");
  });

  it("should not throw on destroy", () => {
    expect(() => infoPage.destroy()).not.toThrow();
  });
});
