import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("initTheme", () => {
  let initTheme;
  let toggleEl;
  let iconEl;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();

    toggleEl = document.createElement("button");
    toggleEl.id = "theme-toggle";
    iconEl = document.createElement("span");
    iconEl.className = "theme-icon";
    toggleEl.appendChild(iconEl);
    document.body.appendChild(toggleEl);

    const module = await import("../js/utils/theme.js");
    initTheme = module.initTheme;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("should set theme to light by default when no saved theme", () => {
    initTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(iconEl.textContent).toBe("🌙");
  });

  it("should restore dark theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    initTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(iconEl.textContent).toBe("☀️");
  });

  it("should toggle from light to dark on click", () => {
    initTheme();
    toggleEl.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(iconEl.textContent).toBe("☀️");
  });

  it("should toggle from dark to light on click", () => {
    localStorage.setItem("theme", "dark");
    initTheme();
    toggleEl.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(iconEl.textContent).toBe("🌙");
  });

  it("should toggle theme multiple times correctly", () => {
    initTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    toggleEl.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    toggleEl.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    toggleEl.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("should persist theme choice to localStorage on every toggle", () => {
    initTheme();
    toggleEl.click();
    expect(localStorage.getItem("theme")).toBe("dark");

    toggleEl.click();
    expect(localStorage.getItem("theme")).toBe("light");
  });
});

describe("restoreTheme", () => {
  let restoreTheme;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    const module = await import("../js/utils/theme.js");
    restoreTheme = module.restoreTheme;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should set data-theme to light when no saved theme", () => {
    document.documentElement.removeAttribute("data-theme");
    restoreTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("should set data-theme to dark when saved in localStorage", () => {
    localStorage.setItem("theme", "dark");
    document.documentElement.removeAttribute("data-theme");
    restoreTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("should not add event listeners or modify icon", () => {
    const addEventListenerSpy = vi.spyOn(
      document.documentElement,
      "addEventListener",
    );
    restoreTheme();
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("should override existing data-theme attribute", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "light");
    restoreTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
