import { describe, it, expect, beforeEach, vi } from "vitest";
describe("qa-page", () => {
  let qaPage;

  beforeEach(async () => {
    vi.resetModules();
  });

  it("should do nothing when container does not exist", async () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    const module = await import("../../js/pages/qa-page.js");
    qaPage = module;
    expect(() => qaPage.init()).not.toThrow();
  });

  it("should render QA categories and items", async () => {
    const mockBtn1 = {
      closest: vi.fn(() => ({
        classList: { contains: vi.fn(() => false), toggle: vi.fn() },
        setAttribute: vi.fn(),
      })),
      setAttribute: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        if (event === "click") {
          handler();
        }
      }),
    };
    const mockContainer = {
      innerHTML: "",
      querySelectorAll: vi.fn(() => [mockBtn1]),
    };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "qa-list") {
        return mockContainer;
      }
      return null;
    });

    const module = await import("../../js/pages/qa-page.js");
    qaPage = module;
    qaPage.init();

    expect(mockContainer.innerHTML).toContain("qa-category");
  });

  it("should not throw on destroy", async () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    const module = await import("../../js/pages/qa-page.js");
    qaPage = module;
    qaPage.init();
    expect(() => qaPage.destroy()).not.toThrow();
  });
});
