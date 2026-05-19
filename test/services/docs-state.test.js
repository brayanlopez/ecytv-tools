import { describe, it, expect, beforeEach, vi } from "vitest";
import docs from "../../data/docs.js";

describe("getDocCategories", () => {
  let getDocCategories;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/services/docs-state.js");
    getDocCategories = module.getDocCategories;
  });

  it("should return categories with 'all' first", () => {
    const categories = getDocCategories();
    expect(categories[0]).toBe("all");
    expect(categories.length).toBeGreaterThan(1);
  });
});

describe("getFilteredDocs", () => {
  let getFilteredDocs;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../js/services/docs-state.js");
    getFilteredDocs = module.getFilteredDocs;
  });

  it("should return all docs when category is 'all'", () => {
    expect(getFilteredDocs("all")).toEqual(docs);
  });

  it("should filter by category", () => {
    const category = docs[0].category;
    const filtered = getFilteredDocs(category);
    expect(filtered.every((d) => d.category === category)).toBe(true);
  });

  it("should return empty array for non-existent category", () => {
    expect(getFilteredDocs("non-existent")).toEqual([]);
  });
});
