import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("initHamburger", () => {
  let initHamburger;
  let hamburgerEl;
  let navLinksEl;
  let linkEls;

  beforeEach(async () => {
    vi.resetModules();

    linkEls = [{ addEventListener: vi.fn() }, { addEventListener: vi.fn() }];

    navLinksEl = {
      classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
      querySelectorAll: vi.fn().mockReturnValue(linkEls),
    };

    hamburgerEl = {
      classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
      addEventListener: vi.fn(),
      setAttribute: vi.fn(),
    };

    vi.spyOn(document, "querySelector").mockImplementation((selector) => {
      if (selector === ".hamburger") return hamburgerEl;
      if (selector === ".nav-links") return navLinksEl;
      return null;
    });

    const module = await import("../js/utils/hamburger.js");
    initHamburger = module.initHamburger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should query the correct DOM elements", () => {
    initHamburger();
    expect(document.querySelector).toHaveBeenCalledWith(".hamburger");
    expect(document.querySelector).toHaveBeenCalledWith(".nav-links");
  });

  it("should add click event listener to hamburger", () => {
    initHamburger();
    expect(hamburgerEl.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  it("should toggle active classes on hamburger click", () => {
    let clickHandler;
    hamburgerEl.addEventListener = vi.fn((event, handler) => {
      if (event === "click") clickHandler = handler;
    });
    initHamburger();
    clickHandler();
    expect(navLinksEl.classList.toggle).toHaveBeenCalledWith("active");
    expect(hamburgerEl.classList.toggle).toHaveBeenCalledWith("active");
  });

  it("should add click event listeners to each nav link", () => {
    initHamburger();
    expect(navLinksEl.querySelectorAll).toHaveBeenCalledWith("a");
    linkEls.forEach((link) => {
      expect(link.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
    });
  });

  it("should remove active classes when a nav link is clicked", () => {
    let linkClickHandler;
    linkEls[0].addEventListener = vi.fn((event, handler) => {
      if (event === "click") linkClickHandler = handler;
    });
    initHamburger();
    linkClickHandler();
    expect(navLinksEl.classList.remove).toHaveBeenCalledWith("active");
    expect(hamburgerEl.classList.remove).toHaveBeenCalledWith("active");
  });

  it("should remove active classes when any nav link is clicked", () => {
    const linkClickHandlers = [];
    linkEls.forEach((link) => {
      link.addEventListener = vi.fn((event, handler) => {
        if (event === "click") linkClickHandlers.push(handler);
      });
    });
    initHamburger();

    linkClickHandlers[1]();
    expect(navLinksEl.classList.remove).toHaveBeenCalledWith("active");
    expect(hamburgerEl.classList.remove).toHaveBeenCalledWith("active");
  });
});
