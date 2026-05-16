import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("../../../js/forms/f4/f4-io.js", () => ({
  handleExportJSON: vi.fn(),
  handleExportYAML: vi.fn(),
  handleImport: vi.fn(),
}));

describe("F4 Form", () => {
  let localStorageMock;

  beforeEach(async () => {
    vi.resetModules();

    localStorageMock = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => localStorageMock[key] ?? null,
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
      delete localStorageMock[key];
    });
    window.EcytvUI = { showSnackbar: vi.fn(), showModal: vi.fn() };
    Element.prototype.scrollIntoView = vi.fn();

    Object.defineProperty(window, "location", {
      value: { href: "", assign: vi.fn() },
      writable: true,
    });

    document.body.innerHTML = `
      <nav>
        <div class="container">
          <a href="#formats" class="logo" id="back-link">← Volver a Formatos</a>
        </div>
      </nav>
      <main class="form-page">
        <form id="f4-form" onsubmit="return false;">
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="proyecto" required placeholder="Nombre del proyecto" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="asignatura" required placeholder="Ej: Dirección de Arte" />
                <datalist id="asignaturas-sugeridas"></datalist>
              </div>
              <div class="form-group">
                <input type="text" id="docente" required placeholder="Nombre del docente" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="directo-responsable" required placeholder="Nombre completo" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <select id="tipo-documento" required>
                  <option value="">Seleccionar...</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                </select>
              </div>
              <div class="form-group">
                <input type="text" id="numero-documento" required placeholder="Número de documento" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="tiun" required placeholder="TIUN" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <table class="equip-table">
              <thead><tr><th>Sala</th><th>Fecha</th><th>Hora inicio</th><th>Hora fin</th><th></th></tr></thead>
              <tbody id="sala-tbody">
                <tr class="sala-row">
                  <td><input type="text" name="sala-nombre" placeholder="Sala" list="salas-sugeridas" /></td>
                  <td><input type="date" name="sala-fecha" required /></td>
                  <td><input type="time" name="sala-hora-inicio" required /></td>
                  <td><input type="time" name="sala-hora-fin" required /></td>
                  <td><button type="button" class="btn-remove-equip" title="Eliminar sala">✕</button></td>
                </tr>
              </tbody>
            </table>
            <datalist id="salas-sugeridas"></datalist>
            <button type="button" class="btn-add-equip" id="add-sala-btn">+ Agregar sala</button>
          </div>
          <div class="form-card">
            <textarea id="observaciones" placeholder="Observaciones..."></textarea>
          </div>
          <div class="form-card" id="history-card" style="display:none">
            <h2>Historial de Solicitudes</h2>
            <div id="history-list"></div>
          </div>
          <div class="form-actions">
            <div class="btn-group">
              <button type="button" class="btn-secondary" id="btn-save">Guardar</button>
              <button type="reset" class="btn-secondary">Limpiar</button>
            </div>
            <div class="dropdown">
              <button type="button" class="btn-submit" id="btn-download">Descargar</button>
              <div class="dropdown-menu" id="download-menu">
                <button type="button" class="dropdown-item" id="btn-pdf">PDF</button>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <span class="form-actions-label">Archivo:</span>
            <div class="btn-group">
              <button type="button" class="btn-secondary" id="btn-import">Importar</button>
              <button type="button" class="btn-secondary" id="btn-export-json">JSON</button>
              <button type="button" class="btn-secondary" id="btn-export-yaml">YAML</button>
            </div>
            <p class="form-actions-hint">Guarda los datos del formulario en un archivo (JSON o YAML) para volver a cargarlos después con el botón Importar.</p>
          </div>
        </form>
      </main>
    `;

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
        (args) =>
          args[0] === "Por favor completa todos los campos obligatorios.",
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

      await new Promise((r) => setTimeout(r, 5));
      expect(document.getElementById("proyecto").value).toBe("");
      expect(document.getElementById("directo-responsable").value).toBe("");
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
    it("should trigger export JSON handler when clicked", async () => {
      const ioMod = await import("../../../js/forms/f4/f4-io.js");
      document.getElementById("btn-export-json").click();
      expect(ioMod.handleExportJSON).toHaveBeenCalled();
    });

    it("should trigger export YAML handler when clicked", async () => {
      const ioMod = await import("../../../js/forms/f4/f4-io.js");
      document.getElementById("btn-export-yaml").click();
      expect(ioMod.handleExportYAML).toHaveBeenCalled();
    });

    it("should trigger import handler when clicked", async () => {
      const ioMod = await import("../../../js/forms/f4/f4-io.js");
      document.getElementById("btn-import").click();
      expect(ioMod.handleImport).toHaveBeenCalled();
    });
  });
});
