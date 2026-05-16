import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F1 ODS Generation", () => {
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
            <div class="btn-group">
              <button type="button" class="btn-secondary" id="btn-save">Guardar</button>
              <button type="reset" class="btn-secondary">Limpiar</button>
            </div>
            <div class="dropdown">
              <button type="button" class="btn-submit" id="btn-download">Descargar</button>
              <div class="dropdown-menu" id="download-menu">
                <button type="button" class="dropdown-item" id="btn-pdf">PDF</button>
                <button type="button" class="dropdown-item" id="btn-ods">ODS</button>
                <button type="button" class="dropdown-item" id="btn-xlsx">XLSX</button>
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
            <p class="form-actions-hint">Guarda los datos del formulario en un archivo (JSON o YAML) para volver a cargarlos despu&eacute;s con el bot&oacute;n Importar.</p>
          </div>
        </form>
      </main>
    `;

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
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("tipo-prestamo").value = "Interno";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
    document.querySelector('input[name="equipo-nombre"]').value = "Cámara";
    document.querySelector('input[name="equipo-consecutivo"]').value =
      "CON-001";
  }

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
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
          "error",
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
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
          "error",
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
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
          "error",
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
      expect(window.EcytvUI.showSnackbar).not.toHaveBeenCalledWith(
        expect.stringContaining("Error al generar el archivo ODS"),
      );
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
        lastRow.querySelector('input[name="equipo-nombre"]').value =
          `Equipo ${i}`;
        lastRow.querySelector('input[name="equipo-consecutivo"]').value =
          `CON-${i}`;
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
});
