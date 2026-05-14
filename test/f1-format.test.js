import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F1 Format", () => {
  let domReadyHandler;
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
    vi.spyOn(window, "alert").mockReturnValue();
    Element.prototype.scrollIntoView = vi.fn();

    Object.defineProperty(window, "location", {
      value: { href: "", assign: vi.fn() },
      writable: true,
    });

    vi.spyOn(document, "addEventListener").mockImplementation(
      (event, handler) => {
        if (event === "DOMContentLoaded") {
          domReadyHandler = handler;
        }
      },
    );

    document.body.innerHTML = `
      <nav>
        <div class="container">
          <a href="#formats" class="logo" id="back-link">← Volver a Formatos</a>
        </div>
      </nav>
      <main class="form-page">
        <form id="f1-form" onsubmit="return false;">
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="proyecto" required placeholder="Nombre del proyecto" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="asignatura" list="asignaturas-sugeridas" required placeholder="Ej: Producción de Televisión" />
                <datalist id="asignaturas-sugeridas"></datalist>
              </div>
              <div class="form-group">
                <input type="text" id="docente" required placeholder="Nombre del docente" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="responsable" required placeholder="Nombre completo" />
              </div>
              <div class="form-group">
                <input type="tel" id="celular" required placeholder="Número de celular" />
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="tiun" required placeholder="TIUN" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="lugar" required placeholder="Ej: Estudio de TV" />
              </div>
              <div class="form-group">
                <select id="tipo-prestamo" required>
                  <option value="">Seleccionar...</option>
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="datetime-local" id="fecha-retiro" required />
              </div>
              <div class="form-group">
                <input type="datetime-local" id="fecha-entrega" required />
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group checkbox-group">
                <input type="checkbox" id="mismo-dia" />
                <label for="mismo-dia">Se entrega el mismo día</label>
              </div>
            </div>
          </div>
          <div class="form-card">
            <table class="equip-table">
              <thead><tr><th>Item</th><th>Equipo</th><th>Consecutivo</th><th></th></tr></thead>
              <tbody id="equip-tbody">
                <tr class="equip-row">
                  <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" /></td>
                  <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required /></td>
                  <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required /></td>
                  <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="btn-add-equip" id="add-equip-btn">+ Agregar equipo</button>
          </div>
          <div class="form-card">
            <textarea id="observaciones" placeholder="Observaciones..."></textarea>
          </div>
          <div class="form-card" id="history-card" style="display:none">
            <h2>Historial de Solicitudes</h2>
            <div id="history-list"></div>
          </div>
          <div class="form-actions">
            <button type="reset" class="btn-secondary">Limpiar</button>
            <button type="button" class="btn-secondary" id="btn-save">Guardar</button>
            <button type="button" class="btn-submit" id="btn-pdf">Descargar PDF</button>
            <button type="button" class="btn-submit" id="btn-ods">Descargar ODS</button>
            <button type="button" class="btn-submit" id="btn-xlsx">Descargar XLSX</button>
          </div>
        </form>
      </main>
    `;

    await import("../js/f1-format.js");
    domReadyHandler();
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
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("tipo-prestamo").value = "Interno";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
    document.querySelector('input[name="equipo-nombre"]').value = "Cámara";
    document.querySelector('input[name="equipo-consecutivo"]').value =
      "CON-001";
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
      expect(window.alert).toHaveBeenCalledWith(
        "Por favor completa todos los campos obligatorios.",
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
      const lastCallArgs = window.alert.mock.calls;
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
      document.getElementById("asignatura").value = "Sonido I";
      document.getElementById("docente").value = "Docente Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("celular").value = "1234567890";
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

      expect(window.alert).toHaveBeenCalledWith(
        "Solicitud guardada en el historial.",
      );
    });

    it("should skip save if proyecto and responsable are empty", () => {
      document.getElementById("btn-save").click();
      expect(window.alert).toHaveBeenCalledWith(
        "Completa al menos el nombre del proyecto y el responsable antes de guardar.",
      );
    });
  });

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("asignatura").value = "Sonido I";

      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorageMock["f1-history"]);
      expect(stored).toHaveLength(1);
      expect(stored[0].data.proyecto).toBe("Proyecto Test");

      document.getElementById("proyecto").value = "";
      document.getElementById("responsable").value = "";
      document.getElementById("asignatura").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("proyecto").value).toBe("Proyecto Test");
      expect(document.getElementById("responsable").value).toBe(
        "Responsable Test",
      );
      expect(document.getElementById("asignatura").value).toBe("Sonido I");
    });

    it("should delete history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("btn-save").click();

      expect(JSON.parse(localStorageMock["f1-history"])).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorageMock["f1-history"])).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe(
        "none",
      );
    });

    it("should limit history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("proyecto").value = "Proyecto " + i;
        document.getElementById("responsable").value = "Responsable " + i;
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorageMock["f1-history"]);
      expect(stored).toHaveLength(20);
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

      await new Promise((r) => setTimeout(r, 5));
      expect(document.getElementById("proyecto").value).toBe("");
      expect(document.getElementById("responsable").value).toBe("");
      expect(document.getElementById("fecha-entrega").disabled).toBe(false);
    });
  });

  describe("Back link", () => {
    it("should navigate to /#formats on click", () => {
      const backLink = document.getElementById("back-link");
      const event = new Event("click");
      vi.spyOn(event, "preventDefault");
      backLink.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  function mockJspdfEnv() {
    const doc = {
      setFillColor: vi.fn(function () {
        return doc;
      }),
      rect: vi.fn(function () {
        return doc;
      }),
      setTextColor: vi.fn(function () {
        return doc;
      }),
      setFontSize: vi.fn(function () {
        return doc;
      }),
      setFont: vi.fn(function () {
        return doc;
      }),
      text: vi.fn(function () {
        return doc;
      }),
      line: vi.fn(function () {
        return doc;
      }),
      splitTextToSize: vi.fn(function (t) {
        return [t];
      }),
      save: vi.fn(),
      autoTable: vi.fn(function () {
        this.lastAutoTable = { finalY: 200 };
      }),
      lastAutoTable: { finalY: 200 },
    };
    window.jspdf = {
      jsPDF: vi.fn(function () {
        return doc;
      }),
    };
    return doc;
  }

  describe("PDF Generation", () => {
    it("should generate PDF when all fields are filled", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(window.jspdf.jsPDF).toHaveBeenCalledOnce();
      expect(doc.save).toHaveBeenCalledWith(
        "F1-Solicitud-Prestamo-Equipos.pdf",
      );
    });

    it("should show alert when jsPDF is not loaded", () => {
      window.jspdf = undefined;
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(window.alert).toHaveBeenCalledWith(
        "Error al cargar la librería PDF. Verifica tu conexión a internet.",
      );
    });

    it("should include form data in the PDF", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("observaciones").value = "Nota importante";
      document.getElementById("btn-pdf").click();

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Proyecto Test");
      expect(allText).toContain("Sonido I");
      expect(allText).toContain("Nota importante");
    });

    it("should use autotable for equipment rows", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(doc.autoTable).toHaveBeenCalled();
      const tableCall = doc.autoTable.mock.calls[0][0];
      expect(tableCall.head[0]).toContain("Equipo");
      expect(tableCall.body[0][1]).toBe("Cámara");
    });

    it("should handle empty equipment gracefully", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.querySelector('input[name="equipo-nombre"]').value = "";
      document.querySelector('input[name="equipo-consecutivo"]').value = "";

      document.getElementById("btn-pdf").click();
      expect(doc.autoTable).not.toHaveBeenCalled();
    });
  });

  describe("ODS Generation", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should show alert when fetch fails for ODS template", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Network error"),
      );
      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
        );
      });
    });

    it("should show alert when ODS template response is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      });
      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
        );
      });
    });

    it("should show alert when JSZip is not loaded", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });
      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
        );
      });
    });

    it("should generate ODS when JSZip and template are available", async () => {
      const cell = "<table:table-cell><text:p>x</text:p></table:table-cell>";
      const tableRows = Array.from(
        { length: 40 },
        () =>
          `<table:table-row>${cell}${cell}${cell}${cell}${cell}</table:table-row>`,
      ).join("");

      window.JSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue({
            async: vi.fn().mockResolvedValue(
              `<?xml version="1.0"?>
              <office:document
                xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
                <office:body>
                  <office:spreadsheet>
                    <table:table>${tableRows}</table:table>
                  </office:spreadsheet>
                </office:body>
              </office:document>`,
            ),
          }),
          generateAsync: vi.fn().mockResolvedValue(new Blob()),
        }),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.JSZip.loadAsync).toHaveBeenCalled();
      });
      expect(window.alert).not.toHaveBeenCalledWith(
        expect.stringContaining("Error al generar el archivo ODS"),
      );
    });
  });

  describe("XLSX Generation", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should show alert when fetch fails for XLSX template", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Network error"),
      );
      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Error al generar el archivo XLSX"),
        );
      });
    });

    it("should show alert when XLSX template response is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      });
      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Error al generar el archivo XLSX"),
        );
      });
    });

    it("should show alert when XLSX library is not loaded", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });
      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining("Error al generar el archivo XLSX"),
        );
      });
    });

    it("should generate XLSX when XLSX library and template are available", async () => {
      window.XLSX = {
        read: vi.fn().mockReturnValue({
          Sheets: { Sheet1: {} },
          SheetNames: ["Sheet1"],
        }),
        write: vi.fn().mockReturnValue(new ArrayBuffer(0)),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.XLSX.read).toHaveBeenCalled();
      });
      expect(window.alert).not.toHaveBeenCalledWith(
        expect.stringContaining("Error al generar el archivo XLSX"),
      );
    });
  });

  describe("PDF branch coverage", () => {
    it("should handle external loan type", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("tipo-prestamo").value = "Externo";

      document.getElementById("btn-pdf").click();
      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Externo");
    });

    it("should handle missing observaciones", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("observaciones").value = "";

      document.getElementById("btn-pdf").click();
      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("sin observaciones");
    });

    it("should handle multiple equipment rows in PDF", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("add-equip-btn").click();
      const rows = document.querySelectorAll(".equip-row");
      rows[1].querySelector('input[name="equipo-nombre"]').value = "Micrófono";
      rows[1].querySelector('input[name="equipo-consecutivo"]').value =
        "MIC-001";
      rows[0].querySelector('input[name="equipo-item"]').value = "1";
      rows[1].querySelector('input[name="equipo-item"]').value = "2";

      document.getElementById("btn-pdf").click();
      expect(doc.autoTable).toHaveBeenCalled();
      expect(doc.autoTable.mock.calls[0][0].body.length).toBe(2);
    });
  });

  describe("ODS additional branch coverage", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should handle 'Externo' loan type in ODS", async () => {
      document.getElementById("tipo-prestamo").value = "Externo";
      const cell = "<table:table-cell><text:p>x</text:p></table:table-cell>";
      const tableRows = Array.from(
        { length: 40 },
        () =>
          `<table:table-row>${cell}${cell}${cell}${cell}${cell}</table:table-row>`,
      ).join("");

      window.JSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue({
            async: vi.fn().mockResolvedValue(
              `<?xml version="1.0"?>
              <office:document
                xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
                <office:body>
                  <office:spreadsheet>
                    <table:table>${tableRows}</table:table>
                  </office:spreadsheet>
                </office:body>
              </office:document>`,
            ),
          }),
          generateAsync: vi.fn().mockResolvedValue(new Blob()),
        }),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-ods").click();
      await vi.waitFor(() => {
        expect(window.JSZip.loadAsync).toHaveBeenCalled();
      });
    });

    it("should handle more than 14 equipment rows in ODS", async () => {
      for (let i = 0; i < 15; i++) {
        document.getElementById("add-equip-btn").click();
        const rows = document.querySelectorAll(".equip-row");
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('input[name="equipo-nombre"]').value = `Equipo ${i}`;
        lastRow.querySelector('input[name="equipo-consecutivo"]').value = `CON-${i}`;
        lastRow.querySelector('input[name="equipo-item"]').value = `${i + 1}`;
      }

      const cell = "<table:table-cell><text:p>x</text:p></table:table-cell>";
      const tableRows = Array.from(
        { length: 40 },
        () =>
          `<table:table-row>${cell}${cell}${cell}${cell}${cell}</table:table-row>`,
      ).join("");

      window.JSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue({
            async: vi.fn().mockResolvedValue(
              `<?xml version="1.0"?>
              <office:document
                xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
                <office:body>
                  <office:spreadsheet>
                    <table:table>${tableRows}</table:table>
                  </office:spreadsheet>
                </office:body>
              </office:document>`,
            ),
          }),
          generateAsync: vi.fn().mockResolvedValue(new Blob()),
        }),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-ods").click();
      await vi.waitFor(() => {
        expect(window.JSZip.loadAsync).toHaveBeenCalled();
      });
    });
  });

  describe("XLSX additional branch coverage", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should handle more than 14 equipment rows in XLSX", async () => {
      for (let i = 0; i < 15; i++) {
        document.getElementById("add-equip-btn").click();
        const rows = document.querySelectorAll(".equip-row");
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('input[name="equipo-nombre"]').value = `Equipo ${i}`;
        lastRow.querySelector('input[name="equipo-consecutivo"]').value = `CON-${i}`;
        lastRow.querySelector('input[name="equipo-item"]').value = `${i + 1}`;
      }

      window.XLSX = {
        read: vi.fn().mockReturnValue({
          Sheets: { Sheet1: {} },
          SheetNames: ["Sheet1"],
        }),
        write: vi.fn().mockReturnValue(new ArrayBuffer(0)),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-xlsx").click();
      await vi.waitFor(() => {
        expect(window.XLSX.read).toHaveBeenCalled();
      });
    });
  });

  describe("History restore edge cases", () => {
    it("should handle mismo-dia state during restore", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
      document.getElementById("mismo-dia").checked = true;
      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      document.getElementById("fecha-retiro").value = "";

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("fecha-entrega").value).toBe(
        "2026-01-01T10:00",
      );
      expect(document.getElementById("fecha-entrega").disabled).toBe(true);
    });

    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("responsable").value = "Test";
      document.getElementById("btn-save").click();

      expect(() => {
        const restoreBtns = document.querySelectorAll(".btn-history-restore");
        if (restoreBtns.length > 0) {
          restoreBtns[0].dataset.id = "nonexistent";
          restoreBtns[0].click();
        }
      }).not.toThrow();
    });
  });
});
