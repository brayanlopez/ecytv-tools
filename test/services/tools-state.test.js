import { describe, it, expect, beforeEach, vi } from "vitest";
import tools from "../../data/tools.js";

describe("getAllValues", () => {
  let getAllValues;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/services/tools-state.js");
    getAllValues = module.getAllValues;
  });

  it("should return all unique categories including 'all'", () => {
    const { categories } = getAllValues();
    expect(categories).toContain("all");
    expect(categories).toContain("Edición");
  });

  it("should return all unique levels including 'all'", () => {
    const { levels } = getAllValues();
    expect(levels).toContain("all");
    expect(levels).toContain("beginner");
    expect(levels).toContain("intermediate");
    expect(levels).toContain("pro");
  });

  it("should return all unique platforms including 'all'", () => {
    const { platforms } = getAllValues();
    expect(platforms).toContain("all");
    expect(platforms).toContain("windows");
    expect(platforms).toContain("mac");
  });

  it("should return all unique pricings including 'all'", () => {
    const { pricings } = getAllValues();
    expect(pricings).toContain("all");
    expect(pricings).toContain("free");
    expect(pricings).toContain("freemium");
    expect(pricings).toContain("paid");
  });

  it("should return sorted platforms", () => {
    const { platforms } = getAllValues();
    const sorted = [...platforms].sort();
    expect(platforms).toEqual(sorted);
  });
});

describe("applyFilters", () => {
  let applyFilters;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/services/tools-state.js");
    applyFilters = module.applyFilters;
  });

  it("should return true when all filters are 'all'", () => {
    const tool = tools[0];
    const activeFilters = { category: "all", level: "all", platform: "all", pricing: "all" };
    expect(applyFilters(tool, activeFilters)).toBe(true);
  });

  it("should filter by category", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, { category: "Edición", level: "all", platform: "all", pricing: "all" }),
    ).toBe(true);
    expect(
      applyFilters(tool, { category: "Diseño", level: "all", platform: "all", pricing: "all" }),
    ).toBe(false);
  });

  it("should filter by level", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, { category: "all", level: "pro", platform: "all", pricing: "all" }),
    ).toBe(true);
    expect(
      applyFilters(tool, { category: "all", level: "beginner", platform: "all", pricing: "all" }),
    ).toBe(false);
  });

  it("should filter by platform", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, { category: "all", level: "all", platform: "windows", pricing: "all" }),
    ).toBe(true);
    expect(
      applyFilters(tool, { category: "all", level: "all", platform: "mobile", pricing: "all" }),
    ).toBe(false);
  });

  it("should filter by pricing", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, { category: "all", level: "all", platform: "all", pricing: "freemium" }),
    ).toBe(true);
    expect(
      applyFilters(tool, { category: "all", level: "all", platform: "all", pricing: "free" }),
    ).toBe(false);
  });
});

describe("getFilteredTools", () => {
  let getFilteredTools;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/services/tools-state.js");
    getFilteredTools = module.getFilteredTools;
  });

  it("should return all tools when no filters applied", () => {
    const result = getFilteredTools(
      { category: "all", level: "all", platform: "all", pricing: "all" },
      "",
    );
    expect(result.length).toBe(tools.length);
  });

  it("should filter by category", () => {
    const result = getFilteredTools(
      { category: "Audio", level: "all", platform: "all", pricing: "all" },
      "",
    );
    expect(result.every((t) => t.category === "Audio")).toBe(true);
  });

  it("should filter by search query", () => {
    const result = getFilteredTools(
      { category: "all", level: "all", platform: "all", pricing: "all" },
      "blender",
    );
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("blender");
  });
});

describe("favorites", () => {
  let getFavorites, toggleFavorite, isFavorite;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    const module = await import("../../js/services/tools-state.js");
    getFavorites = module.getFavorites;
    toggleFavorite = module.toggleFavorite;
    isFavorite = module.isFavorite;
  });

  it("should return empty array initially", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("should add favorite", () => {
    const { isFavorited } = toggleFavorite("test-id");
    expect(isFavorited).toBe(true);
    expect(getFavorites()).toContain("test-id");
  });

  it("should remove favorite", () => {
    toggleFavorite("test-id");
    const { isFavorited } = toggleFavorite("test-id");
    expect(isFavorited).toBe(false);
    expect(getFavorites()).not.toContain("test-id");
  });

  it("should check if id is favorite", () => {
    expect(isFavorite("test-id")).toBe(false);
    toggleFavorite("test-id");
    expect(isFavorite("test-id")).toBe(true);
  });
});
