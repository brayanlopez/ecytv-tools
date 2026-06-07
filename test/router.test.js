import { describe, it, expect, beforeEach, vi } from "vitest";
import router from "../js/router.js";

describe("Router", () => {
  let mockElements;

  beforeEach(() => {
    // Reset router state
    router.routes = {};
    router.currentSection = null;
    router.currentHash = null;

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
    router.register("info", "info-section");
    router.register("tools", "tools-section");
    router.register("formats", "formats-section");
    router.register("docs", "docs-section");

    expect(router.routes["info"]).toBe("info-section");
    expect(router.routes["tools"]).toBe("tools-section");
    expect(router.routes["formats"]).toBe("formats-section");
    expect(router.routes["docs"]).toBe("docs-section");
  });

  it("should handle valid routes", () => {
    router.register("info", "info-section");
    router.register("tools", "tools-section");

    // Mock window.location.hash
    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    router.handleRoute();

    expect(document.getElementById).toHaveBeenCalledWith("tools-section");
  });

  it("should fallback to default route for unknown hash", () => {
    router.register("info", "info-section");
    router.register("tools", "tools-section");

    Object.defineProperty(window, "location", {
      value: { hash: "#unknown" },
      writable: true,
    });

    router.handleRoute();

    // The router falls back to "info-section" (the default)
    expect(document.getElementById).toHaveBeenCalledWith("info-section");
  });

  it("should toggle active class on sections", () => {
    router.register("info", "info-section");
    router.register("tools", "tools-section");

    const infoSection = mockElements["info-section"];
    const toolsSection = mockElements["tools-section"];

    // First navigation
    Object.defineProperty(window, "location", {
      value: { hash: "#info" },
      writable: true,
    });
    router.handleRoute();
    expect(infoSection.classList.add).toHaveBeenCalledWith("active");

    // Second navigation - should remove from previous
    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });
    router.handleRoute();
    expect(infoSection.classList.remove).toHaveBeenCalledWith("active");
    expect(toolsSection.classList.add).toHaveBeenCalledWith("active");
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
    router.register("info", "info-section");
    router.register("tools", "tools-section");

    const mockLinks = [
      { getAttribute: vi.fn(() => "#info"), classList: { toggle: vi.fn() } },
      { getAttribute: vi.fn(() => "#tools"), classList: { toggle: vi.fn() } },
    ];

    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    vi.spyOn(document, "querySelectorAll").mockReturnValue({
      forEach: (callback) => mockLinks.forEach(callback),
    });

    router.handleRoute();

    expect(mockLinks[0].classList.toggle).toHaveBeenCalledWith("active", false);
    expect(mockLinks[1].classList.toggle).toHaveBeenCalledWith("active", true);
  });

  it("should call handleRoute on init", () => {
    router.register("info", "info-section");
    router.register("tools", "tools-section");
    router.register("formats", "formats-section");
    router.register("docs", "docs-section");

    const handleRouteSpy = vi.spyOn(router, "handleRoute");

    router.init();

    expect(handleRouteSpy).toHaveBeenCalledOnce();
  });

  it("should use default route when hash is empty", () => {
    router.register("info", "info-section");
    router.register("tools", "tools-section");

    Object.defineProperty(window, "location", {
      value: { hash: "" },
      writable: true,
    });

    const getElementByIdSpy = vi.spyOn(document, "getElementById");

    router.handleRoute();

    expect(getElementByIdSpy).toHaveBeenCalledWith("info-section");
  });

  it("should set currentSection from active section on init", () => {
    const mockActiveSection = {
      classList: { add: vi.fn(), remove: vi.fn() },
    };
    vi.spyOn(document, "querySelector").mockReturnValue(mockActiveSection);
    vi.spyOn(document, "getElementById").mockReturnValue(null);

    router.init();

    expect(router.currentSection).toBe(mockActiveSection);
  });

  it("should register page modules with registerPage", () => {
    const pageModule = { init: vi.fn() };
    router.registerPage("tools", "tools-section", pageModule);
    expect(router.routes["tools"]).toBe("tools-section");
    expect(router.pageModules["tools"]).toBe(pageModule);
  });

  it("should call page module init when navigating to registered page", () => {
    const pageModule = { init: vi.fn() };
    router.registerPage("tools", "tools-section", pageModule);

    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    router.handleRoute();
    expect(pageModule.init).toHaveBeenCalledOnce();
    expect(router.currentPage).toBe(pageModule);
  });

  it("should destroy previous page before navigating", () => {
    const destroyFn = vi.fn();
    const pageModule1 = { init: vi.fn(), destroy: destroyFn };
    const pageModule2 = { init: vi.fn() };

    router.registerPage("tools", "tools-section", pageModule1);
    router.registerPage("formats", "formats-section", pageModule2);

    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });
    router.handleRoute();
    expect(destroyFn).not.toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      value: { hash: "#formats" },
      writable: true,
    });
    router.handleRoute();
    expect(destroyFn).toHaveBeenCalledOnce();
    expect(pageModule2.init).toHaveBeenCalledOnce();
  });

  it("should set currentPage to null when page module lacks init", () => {
    router.registerPage("tools", "tools-section", {});

    Object.defineProperty(window, "location", {
      value: { hash: "#tools" },
      writable: true,
    });

    router.handleRoute();
    expect(router.currentPage).toBeNull();
  });

  it("should not re-handle same hash twice", () => {
    router.register("info", "info-section");
    router.register("tools", "tools-section");

    const hash = "#info";
    Object.defineProperty(window, "location", {
      value: { hash },
      writable: true,
    });

    router.handleRoute();

    vi.mocked(document.getElementById).mockClear();
    router.handleRoute();
    expect(document.getElementById).not.toHaveBeenCalled();
  });

  it("should not throw when hashchange listener fires", () => {
    expect(() => {
      window.dispatchEvent(new Event("hashchange"));
    }).not.toThrow();
  });
});
