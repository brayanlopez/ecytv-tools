import { describe, it, expect, beforeEach, vi } from "vitest";

describe("tool-card", () => {
  describe("buildToolCard", () => {
    let buildToolCard;

    beforeEach(async () => {
      vi.resetModules();
      const module = await import("../../js/components/tool-card.js");
      buildToolCard = module.buildToolCard;
    });

    function makeTool(overrides = {}) {
      return {
        id: "test",
        name: "Test Tool",
        category: "Edición",
        platform: ["windows"],
        tags: ["tag1"],
        alternatives: [],
        url: "https://example.com",
        icon: "icon.svg",
        pricing: "free",
        level: "beginner",
        description: "A test tool",
        ...overrides,
      };
    }

    it("should render tool card with name and category", () => {
      const html = buildToolCard(makeTool({ name: "Test Tool", category: "Edición" }), false);
      expect(html).toContain("Test Tool");
      expect(html).toContain("Edición");
    });

    it("should render star for favorited tool", () => {
      const html = buildToolCard(makeTool(), true);
      expect(html).toContain("★");
      expect(html).not.toContain("☆");
    });

    it("should render empty star for non-favorited tool", () => {
      const html = buildToolCard(makeTool(), false);
      expect(html).toContain("☆");
      expect(html).not.toContain("★");
    });

    it("should render alternatives section when alternatives exist", () => {
      const html = buildToolCard(makeTool({ alternatives: ["blender"] }), false);
      expect(html).toContain("Alternativas:");
      expect(html).toContain("tool-alternatives");
    });

    it("should not render alternatives section when alternatives is empty", () => {
      const html = buildToolCard(makeTool({ alternatives: [] }), false);
      expect(html).not.toContain("tool-alternatives");
    });

    it("should render platform tags", () => {
      const html = buildToolCard(makeTool({ platform: ["windows", "mac"] }), false);
      expect(html).toContain("platform-tag");
      expect(html).toContain("windows");
      expect(html).toContain("mac");
    });

    it("should render tags", () => {
      const html = buildToolCard(makeTool({ tags: ["video", "audio"] }), false);
      expect(html).toContain("video");
      expect(html).toContain("audio");
    });

    it("should set aria-pressed to true when favorited", () => {
      const html = buildToolCard(makeTool(), true);
      expect(html).toContain('aria-pressed="true"');
    });

    it("should set aria-pressed to false when not favorited", () => {
      const html = buildToolCard(makeTool(), false);
      expect(html).toContain('aria-pressed="false"');
    });
  });

  describe("updateFavoriteButton", () => {
    let updateFavoriteButton;

    beforeEach(async () => {
      vi.resetModules();
      const module = await import("../../js/components/tool-card.js");
      updateFavoriteButton = module.updateFavoriteButton;
    });

    it("should add active class and star when favorited", () => {
      const btn = document.createElement("button");
      btn.classList.add("btn-favorite");
      updateFavoriteButton(btn, true);
      expect(btn.classList.contains("active")).toBe(true);
      expect(btn.textContent).toBe("★");
      expect(btn.getAttribute("aria-label")).toBe("Quitar de favoritos");
      expect(btn.getAttribute("aria-pressed")).toBe("true");
    });

    it("should remove active class and show empty star when not favorited", () => {
      const btn = document.createElement("button");
      btn.classList.add("active");
      btn.textContent = "★";
      updateFavoriteButton(btn, false);
      expect(btn.classList.contains("active")).toBe(false);
      expect(btn.textContent).toBe("☆");
      expect(btn.getAttribute("aria-label")).toBe("Añadir a favoritos");
      expect(btn.getAttribute("aria-pressed")).toBe("false");
    });
  });
});
