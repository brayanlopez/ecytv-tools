import { describe, it, expect } from "vitest";
import qaList from "../../data/qa.js";

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
