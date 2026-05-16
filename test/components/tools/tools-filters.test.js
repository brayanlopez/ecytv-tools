import { describe, it, expect, beforeEach, vi } from "vitest";
import tools from "../../../data/tools.js";

describe("getAllValues", () => {
  let getAllValues;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../../../js/components/tools/tools-filters.js");
    getAllValues = module.getAllValues;
  });

  it("should return all unique categories including 'all'", () => {
    const { categories } = getAllValues();
    expect(categories).toContain("all");
    expect(categories).toContain("Edición");
    expect(categories).toContain("Diseño");
    expect(categories).toContain("VFX");
    expect(categories).toContain("3D");
    expect(categories).toContain("Audio");
    expect(categories).toContain("Producción");
    expect(categories).toContain("Screenplay");
    expect(categories).toContain("Videojuegos");
    expect(categories).toContain("Encoders");
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
    expect(platforms).toContain("linux");
    expect(platforms).toContain("web");
    expect(platforms).toContain("mobile");
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
    const module = await import("../../../js/components/tools/tools-filters.js");
    applyFilters = module.applyFilters;
  });

  it("should return true when all filters are 'all'", () => {
    const tool = tools[0];
    const activeFilters = {
      category: "all",
      level: "all",
      platform: "all",
      pricing: "all",
    };
    expect(applyFilters(tool, activeFilters)).toBe(true);
  });

  it("should filter by category", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "Edición",
        level: "all",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "Diseño",
        level: "all",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(false);
  });

  it("should filter by level", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "all",
        level: "pro",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "all",
        level: "beginner",
        platform: "all",
        pricing: "all",
      }),
    ).toBe(false);
  });

  it("should filter by platform", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "windows",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "mobile",
        pricing: "all",
      }),
    ).toBe(false);
  });

  it("should filter by pricing", () => {
    const tool = tools[0];
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "all",
        pricing: "freemium",
      }),
    ).toBe(true);
    expect(
      applyFilters(tool, {
        category: "all",
        level: "all",
        platform: "all",
        pricing: "free",
      }),
    ).toBe(false);
  });

  it("should apply multiple filters at once", () => {
    const tool = tools[0];
    const filters = {
      category: "Edición",
      level: "pro",
      platform: "windows",
      pricing: "freemium",
    };
    expect(applyFilters(tool, filters)).toBe(true);
    expect(applyFilters(tool, { ...filters, level: "beginner" })).toBe(false);
  });

  it("should handle tools with multiple platforms", () => {
    const capcut = tools.find((t) => t.id === "capcut");
    expect(
      applyFilters(capcut, {
        category: "all",
        level: "all",
        platform: "mobile",
        pricing: "all",
      }),
    ).toBe(true);
    expect(
      applyFilters(capcut, {
        category: "all",
        level: "all",
        platform: "linux",
        pricing: "all",
      }),
    ).toBe(false);
  });
});
