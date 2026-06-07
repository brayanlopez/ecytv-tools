import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F2_FORM_HTML } from "../../fixtures/f2-form-dom.js";

describe("F2 Form", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F2_FORM_HTML;

    await import("../../../js/forms/f2/f2-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Form initialization", () => {
    it("should set theme from localStorage", () => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("should load empty history on init", () => {
      const card = document.getElementById("history-card");
      expect(card.style.display).toBe("none");
    });
  });

  describe("validate()", () => {
    it("should return false when required fields are empty", () => {
      document.getElementById("btn-pdf").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Por favor completa todos los campos obligatorios.",
        "warning",
      );
    });

    it("should mark empty required fields with red border", () => {
      document.getElementById("btn-pdf").click();
      const required = document.querySelectorAll("[required]");
      required.forEach((el) => {
        if (!el.value.trim()) {
          expect(el.style.borderColor).toBe("rgb(230, 57, 70)");
        }
      });
    });

    it("should return true when all required fields are filled", () => {
      document.getElementById("nombre").value = "Juan Pérez";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("contacto").value = "3001234567";
      document.getElementById("periodo-inicial").value = "2026-01-01";
      document.getElementById("periodo-final").value = "2026-02-01";
      document.getElementById("fecha-constancia").value = "2026-01-15";

      document.getElementById("btn-pdf").click();
      const lastCallArgs = window.EcytvUI.showSnackbar.mock.calls;
      const hasValidationError = lastCallArgs.some(
        (args) => args[0] === "Por favor completa todos los campos obligatorios.",
      );
      expect(hasValidationError).toBe(false);
    });
  });

  describe("collectFormData()", () => {
    it("should collect all form field values", () => {
      document.getElementById("nombre").value = "Juan Pérez";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("contacto").value = "3001234567";
      document.getElementById("periodo-inicial").value = "2026-01-01";
      document.getElementById("periodo-final").value = "2026-02-01";
      document.getElementById("fecha-constancia").value = "2026-01-15";
      document.getElementById("firma-nombre").checked = true;
      document.getElementById("observaciones").value = "Test obs";

      document.getElementById("btn-save").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Acta guardada en el historial.",
        "success",
      );
    });

    it("should skip save if nombre is empty", () => {
      document.getElementById("btn-save").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Completa al menos el nombre antes de guardar.",
        "warning",
      );
    });
  });

  describe("Reset", () => {
    it("should clear all form fields on reset", async () => {
      document.getElementById("nombre").value = "Juan Pérez";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("contacto").value = "3001234567";
      document.getElementById("firma-nombre").checked = true;
      document.getElementById("observaciones").value = "Test obs";

      document.querySelector('button[type="reset"]').click();

      await vi.waitFor(() => {
        expect(document.getElementById("nombre").value).toBe("");
        expect(document.getElementById("tipo-documento").value).toBe("");
        expect(document.getElementById("numero-documento").value).toBe("");
        expect(document.getElementById("contacto").value).toBe("");
        expect(document.getElementById("firma-nombre").checked).toBe(false);
        expect(document.getElementById("observaciones").value).toBe("");
      });
    });
  });

  describe("Back link", () => {
    it("should navigate to ./#formats on click", () => {
      const backLink = document.getElementById("back-link");
      const event = new Event("click");
      vi.spyOn(event, "preventDefault");
      backLink.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe("Dropdown button click", () => {
    it("should toggle dropdown menu on click", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      expect(menu.classList.contains("show")).toBe(true);
      expect(btn.classList.contains("active")).toBe(true);
      expect(btn.getAttribute("aria-expanded")).toBe("true");

      btn.click();
      expect(menu.classList.contains("show")).toBe(false);
      expect(btn.classList.contains("active")).toBe(false);
      expect(btn.getAttribute("aria-expanded")).toBe("false");
    });

    it("should close dropdown when clicking outside", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      expect(menu.classList.contains("show")).toBe(true);

      document.dispatchEvent(new Event("click"));
      expect(menu.classList.contains("show")).toBe(false);
    });

    it("should close dropdown when clicking on menu", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      expect(menu.classList.contains("show")).toBe(true);

      menu.click();
      expect(menu.classList.contains("show")).toBe(false);
    });
  });

  describe("Dropdown keyboard navigation", () => {
    it("should open menu with ArrowDown when menu is closed", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(menu.classList.contains("show")).toBe(true);
    });

    it("should open menu with Enter when menu is closed", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(menu.classList.contains("show")).toBe(true);
    });

    it("should open menu with Space when menu is closed", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      expect(menu.classList.contains("show")).toBe(true);
    });

    it("should open menu with ArrowUp when menu is closed", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(menu.classList.contains("show")).toBe(true);
    });

    it("should not open menu on non-navigation key", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(menu.classList.contains("show")).toBe(false);
    });

    it("should navigate down in dropdown menu", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");
      const items = menu.querySelectorAll(".dropdown-item");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(menu.classList.contains("show")).toBe(true);

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(document.activeElement).toBe(items[0]);
    });

    it("should close dropdown with Escape and focus button", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(menu.classList.contains("show")).toBe(true);

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(menu.classList.contains("show")).toBe(false);
      expect(document.activeElement).toBe(btn);
    });

    it("should click active item on Enter in dropdown menu", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");
      const pdfBtn = document.getElementById("btn-pdf");
      const clickSpy = vi.fn();
      pdfBtn.addEventListener("click", clickSpy);

      btn.click();
      expect(menu.classList.contains("show")).toBe(true);

      const items = menu.querySelectorAll(".dropdown-item");
      items[0].focus();

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(clickSpy).toHaveBeenCalled();
    });

    it("should click active item on Space in dropdown menu", () => {
      const menu = document.getElementById("download-menu");
      const pdfBtn = document.getElementById("btn-pdf");
      const clickSpy = vi.fn();
      pdfBtn.addEventListener("click", clickSpy);

      const items = menu.querySelectorAll(".dropdown-item");
      items[0].focus();

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      expect(clickSpy).toHaveBeenCalled();
    });

    it("should wrap navigation to top on ArrowUp from first item", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      const items = menu.querySelectorAll(".dropdown-item");
      items[0].focus();

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(document.activeElement).toBe(items[items.length - 1]);
    });
  });
});
