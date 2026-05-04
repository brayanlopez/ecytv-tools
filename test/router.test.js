import { describe, it, expect, beforeEach, vi } from "vitest";
import router from "../js/router.js";

describe("Router", () => {
  let mockElements;

  beforeEach(() => {
    // Reset router state
    router.routes = {};
    router.currentSection = null;

    // Create mock DOM elements
    mockElements = {
      "tools-section": { classList: { add: vi.fn(), remove: vi.fn() } },
      "formats-section": { classList: { add: vi.fn(), remove: vi.fn() } },
      "info-section": { classList: { add: vi.fn(), remove: vi.fn() } },
      "docs-section": { classList: { add: vi.fn(), remove: vi.fn() } },
    };

    // Mock document.getElementById
    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      return mockElements[id] || null;
    });

    // Mock document.querySelectorAll
    vi.spyOn(document, "querySelectorAll").mockReturnValue({
      forEach: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register routes correctly", () => {
    router.register("tools", "tools-section");
    router.register("formats", "formats-section");

    expect(router.routes["tools"]).toBe("tools-section");
    expect(router.routes["formats"]).toBe("formats-section");
  });

  it("should handle valid routes", () => {
    router.register("tools", "tools-section");
    router.register("formats", "formats-section");

    // Mock window.location.hash
    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    router.handleRoute();

    expect(document.getElementById).toHaveBeenCalledWith("tools-section");
  });

  it("should fallback to default route for unknown hash", () => {
    router.register("tools", "tools-section");

    Object.defineProperty(window, "location", {
      value: { hash: "#unknown" },
      writable: true,
    });

    router.handleRoute();

    // The router falls back to "tools" (the string), not "tools-section"
    // Then it tries to getElementById("tools")
    expect(document.getElementById).toHaveBeenCalledWith("tools");
  });

  it("should toggle active class on sections", () => {
    router.register("tools", "tools-section");
    router.register("formats", "formats-section");

    const toolsSection = mockElements["tools-section"];
    const formatsSection = mockElements["formats-section"];

    // First navigation
    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });
    router.handleRoute();
    expect(toolsSection.classList.add).toHaveBeenCalledWith("active");

    // Second navigation - should remove from previous
    Object.defineProperty(window, "location", {
      value: { hash: "#formats" },
      writable: true,
    });
    router.handleRoute();
    expect(toolsSection.classList.remove).toHaveBeenCalledWith("active");
    expect(formatsSection.classList.add).toHaveBeenCalledWith("active");
  });

  it("should handle missing section gracefully", () => {
    router.register("tools", "tools-section");

    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    // Mock getElementById to return null
    vi.spyOn(document, "getElementById").mockReturnValue(null);

    expect(() => router.handleRoute()).not.toThrow();
  });

  it("should update nav-links active state", () => {
    router.register("tools", "tools-section");

    const mockLinks = [
      { getAttribute: vi.fn(() => "#tools"), classList: { toggle: vi.fn() } },
      { getAttribute: vi.fn(() => "#formats"), classList: { toggle: vi.fn() } },
    ];

    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    vi.spyOn(document, "querySelectorAll").mockReturnValue({
      forEach: (callback) => mockLinks.forEach(callback),
    });

    router.handleRoute();

    expect(mockLinks[0].classList.toggle).toHaveBeenCalledWith("active", true);
    expect(mockLinks[1].classList.toggle).toHaveBeenCalledWith("active", false);
  });

  it("should call handleRoute on init", () => {
    router.register("tools", "tools-section");

    const handleRouteSpy = vi.spyOn(router, "handleRoute");

    router.init();

    expect(handleRouteSpy).toHaveBeenCalledOnce();
  });

  it("should use default route when hash is empty", () => {
    router.register("tools", "tools-section");

    Object.defineProperty(window, "location", {
      value: { hash: "" },
      writable: true,
    });

    const getElementByIdSpy = vi.spyOn(document, "getElementById");

    router.handleRoute();

    expect(getElementByIdSpy).toHaveBeenCalledWith("tools-section");
  });
});
