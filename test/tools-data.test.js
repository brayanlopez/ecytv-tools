import { describe, it, expect } from "vitest";
import tools from "../data/tools.js";

describe("Tools Data", () => {
  it("should have at least one tool", () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it("should have unique IDs", () => {
    const ids = tools.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all required fields", () => {
    const requiredFields = [
      "id",
      "name",
      "url",
      "description",
      "category",
      "pricing",
      "platform",
      "tags",
      "level",
      "alternatives",
      "icon",
    ];

    tools.forEach((tool) => {
      requiredFields.forEach((field) => {
        expect(tool).toHaveProperty(field);
      });
    });
  });

  it("should have valid platform values", () => {
    const validPlatforms = ["windows", "mac", "linux", "web", "mobile"];

    tools.forEach((tool) => {
      expect(Array.isArray(tool.platform)).toBe(true);
      tool.platform.forEach((p) => {
        expect(validPlatforms).toContain(p);
      });
    });
  });

  it("should have valid level values", () => {
    const validLevels = ["beginner", "intermediate", "pro"];

    tools.forEach((tool) => {
      expect(validLevels).toContain(tool.level);
    });
  });

  it("should have valid pricing values", () => {
    const validPricing = ["free", "freemium", "paid"];

    tools.forEach((tool) => {
      expect(validPricing).toContain(tool.pricing);
    });
  });

  it("should have alternatives that exist in tools", () => {
    const toolIds = new Set(tools.map((t) => t.id));

    tools.forEach((tool) => {
      tool.alternatives.forEach((altId) => {
        expect(toolIds.has(altId)).toBe(true);
      });
    });
  });

  it("should have valid URLs", () => {
    tools.forEach((tool) => {
      expect(tool.url).toMatch(/^https?:\/\//);
    });
  });
});
