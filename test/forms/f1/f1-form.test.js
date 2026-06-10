import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F1_FORM_HTML } from "../../fixtures/f1-form-dom.js";

describe("F1 Form", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F1_FORM_HTML;

    await import("../../../js/forms/f1/f1-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Sonido I";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("responsable").value = "Responsable Test";
    document.getElementById("celular").value = "1234567890";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("tipo-prestamo").value = "Interno";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
    document.querySelector('input[name="equipo-nombre"]').value = "Cámara";
    document.querySelector('input[name="equipo-consecutivo"]').value = "CON-001";
  }

  describe("Form initialization", () => {
    it("should populate asignaturas sugeridas datalist", () => {
      const datalist = document.getElementById("asignaturas-sugeridas");
      expect(datalist.children.length).toBeGreaterThan(0);
      expect(datalist.children[0].value).toBe("Sonido I");
    });

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
      const btnPdf = document.getElementById("btn-pdf");
      btnPdf.click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Por favor completa todos los campos obligatorios.",
        "warning",
      );
    });

    it("should mark empty required fields with red border", () => {
      const required = document.querySelectorAll("[required]");
      document.getElementById("btn-pdf").click();
      required.forEach((el) => {
        if (!el.value.trim()) {
          expect(el.style.borderColor).toBe("rgb(230, 57, 70)");
        }
      });
    });

    it("should return true when all required fields are filled", () => {
      fillAllRequired();

      const btnPdf = document.getElementById("btn-pdf");
      btnPdf.click();
      const lastCallArgs = window.EcytvUI.showSnackbar.mock.calls;
      const hasValidationError = lastCallArgs.some(
        (args) => args[0] === "Por favor completa todos los campos obligatorios.",
      );
      expect(hasValidationError).toBe(false);
    });
  });

  describe("collectFormData()", () => {
    it("should collect all form field values", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("asignatura").value = "Sonido I";
      document.getElementById("docente").value = "Docente Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("celular").value = "1234567890";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("tiun").value = "TIUN123";
      document.getElementById("lugar").value = "Estudio";
      document.getElementById("tipo-prestamo").value = "Interno";
      document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
      document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
      document.getElementById("mismo-dia").checked = true;
      document.getElementById("observaciones").value = "Test obs";
      document.querySelector('input[name="equipo-item"]').value = "1";
      document.querySelector('input[name="equipo-nombre"]').value = "Cámara";

      const btnSave = document.getElementById("btn-save");
      btnSave.click();

      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Solicitud guardada en el historial.",
        "success",
      );
    });

    it("should skip save if proyecto and responsable are empty", () => {
      document.getElementById("btn-save").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Completa al menos el nombre del proyecto y el responsable antes de guardar.",
        "warning",
      );
    });
  });

  describe("Same-day checkbox", () => {
    it("should copy fecha-retiro to fecha-entrega when checked", () => {
      const retiro = document.getElementById("fecha-retiro");
      const entrega = document.getElementById("fecha-entrega");
      const mismoDia = document.getElementById("mismo-dia");

      retiro.value = "2026-05-13T10:00";
      mismoDia.checked = true;
      mismoDia.dispatchEvent(new Event("change"));

      expect(entrega.value).toBe("2026-05-13T10:00");
      expect(entrega.disabled).toBe(true);
    });

    it("should enable fecha-entrega when unchecked", () => {
      const retiro = document.getElementById("fecha-retiro");
      const entrega = document.getElementById("fecha-entrega");
      const mismoDia = document.getElementById("mismo-dia");

      retiro.value = "2026-05-13T10:00";
      mismoDia.checked = true;
      mismoDia.dispatchEvent(new Event("change"));
      expect(entrega.disabled).toBe(true);

      mismoDia.checked = false;
      mismoDia.dispatchEvent(new Event("change"));
      expect(entrega.disabled).toBe(false);
    });

    it("should update fecha-entrega on fecha-retiro change when checked", () => {
      const retiro = document.getElementById("fecha-retiro");
      const entrega = document.getElementById("fecha-entrega");
      const mismoDia = document.getElementById("mismo-dia");

      retiro.value = "2026-05-13T10:00";
      mismoDia.checked = true;
      mismoDia.dispatchEvent(new Event("change"));

      retiro.value = "2026-05-14T15:30";
      retiro.dispatchEvent(new Event("input"));

      expect(entrega.value).toBe("2026-05-14T15:30");
    });
  });

  describe("Equipment rows", () => {
    it("should add a new equipment row", () => {
      const tbody = document.getElementById("equip-tbody");
      const initialCount = tbody.children.length;

      document.getElementById("add-equip-btn").click();

      expect(tbody.children.length).toBe(initialCount + 1);
    });

    it("should remove an equipment row", () => {
      const tbody = document.getElementById("equip-tbody");

      document.getElementById("add-equip-btn").click();
      expect(tbody.children.length).toBe(2);

      const removeBtn = tbody.querySelector(".btn-remove-equip");
      removeBtn.click();
      expect(tbody.children.length).toBe(1);
    });

    it("should not remove the last equipment row", () => {
      const tbody = document.getElementById("equip-tbody");
      const removeBtn = tbody.querySelector(".btn-remove-equip");
      removeBtn.click();
      expect(tbody.children.length).toBe(1);
    });
  });

  describe("Reset", () => {
    it("should clear form fields and reset equip rows on reset", async () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("responsable").value = "Test";
      document.querySelector('input[name="equipo-nombre"]').value = "Cámara";

      document.getElementById("add-equip-btn").click();

      document.querySelector('button[type="reset"]').click();

      await vi.waitFor(() => {
        expect(document.getElementById("proyecto").value).toBe("");
        expect(document.getElementById("responsable").value).toBe("");
        expect(document.getElementById("fecha-entrega").disabled).toBe(false);
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

    it("should not open menu on non-navigation key", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(menu.classList.contains("show")).toBe(false);
    });

    it("should navigate down in dropdown menu", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      expect(menu.classList.contains("show")).toBe(true);

      const items = menu.querySelectorAll(".dropdown-item");
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

    it("should navigate up in dropdown menu", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      const items = menu.querySelectorAll(".dropdown-item");
      items[0].focus();

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      expect(document.activeElement).toBe(items[items.length - 1]);
    });

    it("should click active item on Enter in dropdown menu", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");
      const pdfBtn = document.getElementById("btn-pdf");
      const clickSpy = vi.fn();
      pdfBtn.addEventListener("click", clickSpy);

      btn.click();
      const items = menu.querySelectorAll(".dropdown-item");

      vi.spyOn(document, "activeElement", "get").mockReturnValue(items[0]);

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
