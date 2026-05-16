import { describe, it, expect } from "vitest";
import docs from "../../data/docs.js";

describe("Docs Data", () => {
  it("should have at least one doc", () => {
    expect(docs.length).toBeGreaterThan(0);
  });

  it("should have unique IDs", () => {
    const ids = docs.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all required fields", () => {
    const requiredFields = [
      "id",
      "name",
      "category",
      "type",
      "description",
      "url",
      "manufacturer",
    ];

    docs.forEach((doc) => {
      requiredFields.forEach((field) => {
        expect(doc).toHaveProperty(field);
      });
    });
  });

  it("should have valid type values", () => {
    const validTypes = ["manual", "guide"];
    docs.forEach((doc) => {
      expect(validTypes).toContain(doc.type);
    });
  });

  it("should have valid URLs or placeholder", () => {
    docs.forEach((doc) => {
      if (doc.url !== "#") {
        expect(doc.url).toMatch(/^https?:\/\//);
      }
    });
  });

  it("should have at least one guide type", () => {
    const guides = docs.filter((d) => d.type === "guide");
    expect(guides.length).toBeGreaterThan(0);
  });

  it("should have at least one manual type", () => {
    const manuals = docs.filter((d) => d.type === "manual");
    expect(manuals.length).toBeGreaterThan(0);
  });

  it("should have categories", () => {
    const categories = [...new Set(docs.map((d) => d.category))];
    expect(categories.length).toBeGreaterThan(0);
    categories.forEach((cat) => {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    });
  });
});
