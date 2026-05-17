import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initDropdown } from "../../../js/forms/common/dropdown.js";

describe("initDropdown", () => {
  let btn, menu;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="test-btn">Toggle</button>
      <div id="test-menu" class="dropdown-menu">
        <button class="dropdown-item" id="item-1">Item 1</button>
        <button class="dropdown-item" id="item-2">Item 2</button>
      </div>
    `;
    btn = document.getElementById("test-btn");
    menu = document.getElementById("test-menu");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a close function when elements exist", () => {
    const dropdown = initDropdown("test-btn", "test-menu");
    expect(dropdown).toHaveProperty("close");
    expect(typeof dropdown.close).toBe("function");
  });

  it("should return noop close when btn is missing", () => {
    const dropdown = initDropdown("nonexistent-btn", "test-menu");
    dropdown.close();
    expect(menu.classList.contains("show")).toBe(false);
  });

  it("should return noop close when menu is missing", () => {
    const dropdown = initDropdown("test-btn", "nonexistent-menu");
    dropdown.close();
    expect(btn.classList.contains("active")).toBe(false);
  });

  it("should toggle menu on btn click", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    expect(menu.classList.contains("show")).toBe(true);
    expect(btn.classList.contains("active")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("true");

    btn.click();
    expect(menu.classList.contains("show")).toBe(false);
    expect(btn.classList.contains("active")).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("should close menu when clicking outside", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    expect(menu.classList.contains("show")).toBe(true);

    document.dispatchEvent(new Event("click"));
    expect(menu.classList.contains("show")).toBe(false);
  });

  it("should close menu when clicking on menu", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    expect(menu.classList.contains("show")).toBe(true);

    menu.dispatchEvent(new Event("click"));
    expect(menu.classList.contains("show")).toBe(false);
  });

  it("should open menu with ArrowDown key on btn", () => {
    initDropdown("test-btn", "test-menu");
    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(menu.classList.contains("show")).toBe(true);
    expect(btn.classList.contains("active")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("should open menu with Enter key on btn", () => {
    initDropdown("test-btn", "test-menu");
    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(menu.classList.contains("show")).toBe(true);
  });

  it("should open menu with Space key on btn", () => {
    initDropdown("test-btn", "test-menu");
    btn.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(menu.classList.contains("show")).toBe(true);
  });

  it("should not open menu on non-navigation key", () => {
    initDropdown("test-btn", "test-menu");
    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect(menu.classList.contains("show")).toBe(false);
  });

  it("should not fail when menu has no items on btn keydown", () => {
    document.body.innerHTML = `
      <button id="test-btn">Toggle</button>
      <div id="empty-menu" class="dropdown-menu"></div>
    `;
    initDropdown("test-btn", "empty-menu");
    expect(() => {
      document
        .getElementById("test-btn")
        .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    }).not.toThrow();
  });

  it("should navigate down in menu", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    const items = menu.querySelectorAll(".dropdown-item");

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(document.activeElement).toBe(items[0]);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(document.activeElement).toBe(items[1]);
  });

  it("should wrap navigation to first on ArrowDown from last item", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    const items = menu.querySelectorAll(".dropdown-item");

    items[items.length - 1].focus();
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(document.activeElement).toBe(items[0]);
  });

  it("should navigate up in menu", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    const items = menu.querySelectorAll(".dropdown-item");

    items[0].focus();
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it("should close with Escape and focus btn", () => {
    initDropdown("test-btn", "test-menu");
    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(menu.classList.contains("show")).toBe(true);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(menu.classList.contains("show")).toBe(false);
    expect(document.activeElement).toBe(btn);
  });

  it("should click active item on Enter in menu", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    const item1 = document.getElementById("item-1");
    const clickSpy = vi.fn();
    item1.addEventListener("click", clickSpy);

    vi.spyOn(document, "activeElement", "get").mockReturnValue(item1);
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should click active item on Space in menu", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    const item1 = document.getElementById("item-1");
    const clickSpy = vi.fn();
    item1.addEventListener("click", clickSpy);

    vi.spyOn(document, "activeElement", "get").mockReturnValue(item1);
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should not click when activeElement is not a menu item", () => {
    initDropdown("test-btn", "test-menu");
    btn.click();
    vi.spyOn(document, "activeElement", "get").mockReturnValue(document.body);

    expect(() => {
      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    }).not.toThrow();
  });
});
