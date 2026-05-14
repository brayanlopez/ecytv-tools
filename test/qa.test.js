import { describe, it, expect, beforeEach, vi } from "vitest";
import qaList from "../data/qa.js";

describe("QA Data", () => {
  it("should have at least one item", () => {
    expect(qaList.length).toBeGreaterThan(0);
  });

  it("should have unique IDs", () => {
    const ids = qaList.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all required fields", () => {
    const requiredFields = ["id", "category", "question", "answer"];

    qaList.forEach((item) => {
      requiredFields.forEach((field) => {
        expect(item).toHaveProperty(field);
      });
    });
  });

  it("should have non-empty strings for all string fields", () => {
    qaList.forEach((item) => {
      expect(typeof item.id).toBe("string");
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.category).toBe("string");
      expect(item.category.length).toBeGreaterThan(0);
      expect(typeof item.question).toBe("string");
      expect(item.question.length).toBeGreaterThan(0);
      expect(typeof item.answer).toBe("string");
      expect(item.answer.length).toBeGreaterThan(0);
    });
  });

  it("should have answers with meaningful length", () => {
    qaList.forEach((item) => {
      expect(item.answer.length).toBeGreaterThan(20);
    });
  });

  it("should have categories", () => {
    const categories = [...new Set(qaList.map((item) => item.category))];
    expect(categories.length).toBeGreaterThan(0);
    categories.forEach((cat) => {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    });
  });

  it("each category should have at least one item", () => {
    const categories = [...new Set(qaList.map((item) => item.category))];
    categories.forEach((cat) => {
      const items = qaList.filter((item) => item.category === cat);
      expect(items.length).toBeGreaterThan(0);
    });
  });
});

describe("QaRenderer", () => {
  let QaRenderer;
  let mockContainer;

  beforeEach(async () => {
    vi.resetModules();

    mockContainer = {
      innerHTML: "",
      querySelectorAll: vi.fn().mockReturnValue([]),
    };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "qa-list") return mockContainer;
      return null;
    });

    const module = await import("../js/qa-renderer.js");
    QaRenderer = module.QaRenderer;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with correct container", () => {
    const renderer = new QaRenderer();
    expect(renderer.container).toBe(mockContainer);
  });

  it("should return categories from data", () => {
    const renderer = new QaRenderer();
    const categories = renderer.getCategories();
    const uniqueCategories = [...new Set(qaList.map((item) => item.category))];
    expect(categories.length).toBe(uniqueCategories.length);
    uniqueCategories.forEach((cat) => {
      expect(categories).toContain(cat);
    });
  });

  it("should do nothing when container does not exist", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);
    const renderer = new QaRenderer();
    expect(() => renderer.render()).not.toThrow();
  });

  it("should render QA items grouped by category", () => {
    const renderer = new QaRenderer();
    renderer.render();

    const categories = [...new Set(qaList.map((item) => item.category))];
    categories.forEach((cat) => {
      expect(mockContainer.innerHTML).toContain(cat);
    });
    expect(mockContainer.innerHTML).toContain("qa-category");
    expect(mockContainer.innerHTML).toContain("qa-category-title");
    expect(mockContainer.innerHTML).toContain("qa-items");
  });

  it("should render question buttons with correct structure", () => {
    const renderer = new QaRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("qa-item");
    expect(mockContainer.innerHTML).toContain("qa-question");
    expect(mockContainer.innerHTML).toContain("qa-chevron");
    expect(mockContainer.innerHTML).toContain('aria-expanded="false"');
  });

  it("should render all questions from data", () => {
    const renderer = new QaRenderer();
    renderer.render();

    qaList.forEach((item) => {
      expect(mockContainer.innerHTML).toContain(item.question);
      expect(mockContainer.innerHTML).toContain(`data-id="${item.id}"`);
    });
  });

  it("should render answers", () => {
    const renderer = new QaRenderer();
    renderer.render();

    expect(mockContainer.innerHTML).toContain("qa-answer");
    qaList.forEach((item) => {
      expect(mockContainer.innerHTML).toContain(item.answer);
    });
  });

  it("should attach click event listeners to question buttons", () => {
    const mockBtn1 = {
      addEventListener: vi.fn(),
      closest: vi.fn(),
      setAttribute: vi.fn(),
    };
    const mockBtn2 = {
      addEventListener: vi.fn(),
      closest: vi.fn(),
      setAttribute: vi.fn(),
    };

    mockContainer.querySelectorAll = vi
      .fn()
      .mockReturnValue([mockBtn1, mockBtn2]);

    const renderer = new QaRenderer();
    renderer.render();

    expect(mockContainer.querySelectorAll).toHaveBeenCalledWith(".qa-question");
    expect(mockBtn1.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(mockBtn2.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  it("should toggle open class on click", () => {
    const mockItem = {
      classList: { toggle: vi.fn(), contains: vi.fn() },
    };
    const mockBtn = {
      addEventListener: vi.fn((_, handler) => {
        handler();
      }),
      closest: vi.fn(() => mockItem),
      setAttribute: vi.fn(),
    };

    mockContainer.querySelectorAll = vi.fn().mockReturnValue([mockBtn]);

    const renderer = new QaRenderer();
    renderer.render();

    expect(mockItem.classList.toggle).toHaveBeenCalledWith("open");
    expect(mockBtn.setAttribute).toHaveBeenCalledWith("aria-expanded", true);
  });

  it("should render items with data-id attributes", () => {
    const renderer = new QaRenderer();
    renderer.render();

    qaList.forEach((item) => {
      expect(mockContainer.innerHTML).toContain(`data-id="${item.id}"`);
    });
  });

  it("should call render on init", () => {
    const renderer = new QaRenderer();
    const renderSpy = vi.spyOn(renderer, "render");
    renderer.init();
    expect(renderSpy).toHaveBeenCalledOnce();
  });
});
