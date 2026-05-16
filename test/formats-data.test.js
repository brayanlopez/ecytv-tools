import { describe, it, expect } from "vitest";
import formats from "../data/formats.js";

describe("Formats Data", () => {
  it("should have at least one format", () => {
    expect(formats.length).toBeGreaterThan(0);
  });

  it("should have unique IDs", () => {
    const ids = formats.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all required fields", () => {
    const requiredFields = ["id", "name", "description", "url", "label", "available", "icon"];
    formats.forEach((f) => {
      requiredFields.forEach((field) => {
        expect(f).toHaveProperty(field);
      });
    });
  });

  it("should have non-empty name and description", () => {
    formats.forEach((f) => {
      expect(typeof f.name).toBe("string");
      expect(f.name.length).toBeGreaterThan(0);
      expect(typeof f.description).toBe("string");
      expect(f.description.length).toBeGreaterThan(0);
    });
  });

  it("should have at least one available format", () => {
    const available = formats.filter((f) => f.available);
    expect(available.length).toBeGreaterThan(0);
  });
});
