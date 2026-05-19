import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F4_FORM_HTML } from "../../fixtures/f4-form-dom.js";

vi.mock("../../../js/forms/common/io-config.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    importFromFile: vi.fn().mockRejectedValue(new Error("Simulated error")),
  };
});

describe("F4 Form", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F4_FORM_HTML;

    await import("../../../js/forms/f4/f4-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Dirección de Arte";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("directo-responsable").value = "Responsable Test";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("tiun").value = "TIUN123";
    document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
    document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
    document.querySelector('input[name="sala-hora-fin"]').value = "10:00";
  }

  describe("Form initialization", () => {
    it("should populate salas sugeridas datalist", () => {
      const datalist = document.getElementById("salas-sugeridas");
      expect(datalist.children.length).toBeGreaterThan(0);
      expect(datalist.children[0].value).toBe("Sala de edición NL1");
    });

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
      document.getElementById("asignatura").value = "Dirección de Arte";
      document.getElementById("docente").value = "Docente Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("tiun").value = "TIUN123";
      document.getElementById("observaciones").value = "Test obs";
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
      document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
      document.querySelector('input[name="sala-hora-fin"]').value = "10:00";

      const btnSave = document.getElementById("btn-save");
      btnSave.click();

      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Solicitud guardada en el historial.",
        "success",
      );
    });

    it("should skip save if proyecto and directo-responsable are empty", () => {
      document.getElementById("btn-save").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Completa al menos el nombre del proyecto y el directo responsable antes de guardar.",
        "warning",
      );
    });
  });

  describe("Sala rows", () => {
    it("should add a new sala row", () => {
      const tbody = document.getElementById("sala-tbody");
      const initialCount = tbody.children.length;

      document.getElementById("add-sala-btn").click();

      expect(tbody.children.length).toBe(initialCount + 1);
    });

    it("should remove a sala row", () => {
      const tbody = document.getElementById("sala-tbody");

      document.getElementById("add-sala-btn").click();
      expect(tbody.children.length).toBe(2);

      const removeBtn = tbody.querySelector(".btn-remove-equip");
      removeBtn.click();
      expect(tbody.children.length).toBe(1);
    });

    it("should not remove the last sala row", () => {
      const tbody = document.getElementById("sala-tbody");
      const removeBtn = tbody.querySelector(".btn-remove-equip");
      removeBtn.click();
      expect(tbody.children.length).toBe(1);
    });

    it("should remove a dynamically added sala row via its own button", () => {
      const tbody = document.getElementById("sala-tbody");
      document.getElementById("add-sala-btn").click();
      expect(tbody.children.length).toBe(2);

      const removeBtns = tbody.querySelectorAll(".btn-remove-equip");
      removeBtns[1].click();
      expect(tbody.children.length).toBe(1);
    });
  });

  describe("Reset", () => {
    it("should clear form fields and reset sala rows on reset", async () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("directo-responsable").value = "Test";
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";

      document.getElementById("add-sala-btn").click();

      document.querySelector('button[type="reset"]').click();

      await vi.waitFor(() => {
        expect(document.getElementById("proyecto").value).toBe("");
        expect(document.getElementById("directo-responsable").value).toBe("");
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
      const items = menu.querySelectorAll(".dropdown-item");

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(menu.classList.contains("show")).toBe(true);

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(menu.classList.contains("show")).toBe(false);
      expect(document.activeElement).toBe(btn);
    });

    it("should not reopen menu on keydown when already open", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      expect(menu.classList.contains("show")).toBe(true);

      btn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      expect(menu.classList.contains("show")).toBe(true);
    });

    it("should not click when activeElement is not in menu items", () => {
      const btn = document.getElementById("btn-download");
      const menu = document.getElementById("download-menu");

      btn.click();
      const items = menu.querySelectorAll(".dropdown-item");

      vi.spyOn(document, "activeElement", "get").mockReturnValue(document.body);

      menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(document.activeElement).toBe(document.body);
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

  describe("Export/Import buttons", () => {
    it("should show success snackbar on export JSON click", () => {
      document.getElementById("btn-export-json").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Datos exportados en JSON correctamente.",
        "success",
      );
    });

    it("should show success snackbar on export YAML click", () => {
      document.getElementById("btn-export-yaml").click();
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        "Datos exportados en YAML correctamente.",
        "success",
      );
    });

    it("should show error snackbar on import click when import fails", async () => {
      document.getElementById("btn-import").click();
      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith("Simulated error", "error");
      });
    });
  });
});
