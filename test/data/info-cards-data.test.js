import { describe, it, expect } from "vitest";
import infoCards from "../../data/info-cards.js";

describe("Info Cards Data", () => {
  it("should have exactly 4 cards", () => {
    expect(infoCards).toHaveLength(4);
  });

  it("should have all required fields on every card", () => {
    const requiredFields = ["icon", "title", "description", "url", "label"];

    infoCards.forEach((card) => {
      requiredFields.forEach((field) => {
        expect(card).toHaveProperty(field);
        expect(typeof card[field]).toBe("string");
        expect(card[field].length).toBeGreaterThan(0);
      });
    });
  });

  it("should have valid URLs", () => {
    infoCards.forEach((card) => {
      expect(card.url).toMatch(/^https?:\/\//);
    });
  });

  it("should have SVG icons", () => {
    infoCards.forEach((card) => {
      expect(card.icon).toMatch(/^<svg/);
      expect(card.icon).toContain("</svg>");
    });
  });

  it("should have the correct titles", () => {
    const titles = infoCards.map((c) => c.title);
    expect(titles).toContain("Programación de Recursos - Lab Postproducción");
    expect(titles).toContain("Programación de Recursos - Lab Instrumentos");
    expect(titles).toContain("Base de datos Casting general de la Escuela");
    expect(titles).toContain("Bases de datos recursos producción escuela de cine y tv");
  });

  it("should have unique titles", () => {
    const titles = infoCards.map((c) => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
