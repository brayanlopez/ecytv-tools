import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F3 PDF Generation", () => {
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
        <form id="f3-form" onsubmit="return false;">
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="proyecto" required placeholder="Nombre del proyecto" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="asignatura" list="asignaturas-sugeridas" required placeholder="Ej: Dirección de Arte" />
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
                <input type="text" id="autorizado" required placeholder="Nombre completo" />
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
              <div class="form-group">
                <input type="tel" id="celular" required placeholder="Número de celular" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="lugar" required placeholder="Ej: Estudio de TV" />
              </div>
              <div class="form-group">
                <input type="datetime-local" id="fecha-retiro" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="datetime-local" id="fecha-entrega" required />
              </div>
              <div class="form-group checkbox-group">
                <input type="checkbox" id="mismo-dia" />
                <label for="mismo-dia">Se entrega el mismo día</label>
              </div>
            </div>
          </div>
          <div class="form-card">
            <table class="equip-table">
              <thead><tr><th>Item</th><th>Tipo</th><th>Cantidad</th><th>Código</th><th>Elemento</th><th></th></tr></thead>
              <tbody id="equip-tbody">
                <tr class="equip-row">
                  <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" /></td>
                  <td><input type="text" name="equipo-tipo" placeholder="Tipo" required /></td>
                  <td><input type="number" name="equipo-cantidad" placeholder="Cantidad" required min="1" /></td>
                  <td><input type="text" name="equipo-codigo" placeholder="Código" required /></td>
                  <td><input type="text" name="equipo-elemento" placeholder="Elemento" required /></td>
                  <td><button type="button" class="btn-remove-equip" title="Eliminar elemento">✕</button></td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="btn-add-equip" id="add-equip-btn">+ Agregar elemento</button>
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
            <p class="form-actions-hint">Guarda los datos del formulario en un archivo (JSON o YAML) para volver a cargarlos despu&eacute;s con el bot&oacute;n Importar.</p>
          </div>
        </form>
      </main>
    `;

    await import("../../../js/forms/f3/f3-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Dirección de Arte";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("autorizado").value = "Autorizado Test";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("celular").value = "3001234567";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
    document.querySelector('input[name="equipo-tipo"]').value = "Iluminación";
    document.querySelector('input[name="equipo-cantidad"]').value = "2";
    document.querySelector('input[name="equipo-codigo"]').value = "COD-001";
    document.querySelector('input[name="equipo-elemento"]').value = "Reflector";
  }

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
        "F3-Solicitud-Bodega-Arte.pdf",
      );
    });

    it("should show alert when jsPDF is not loaded", () => {
      window.jspdf = undefined;
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
        "Error al cargar la librería PDF. Verifica tu conexión a internet.",
        "error",
      );
    });

    it("should include form data in the PDF", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("observaciones").value = "Nota importante";
      document.getElementById("btn-pdf").click();

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Proyecto Test");
      expect(allText).toContain("Dirección de Arte");
      expect(allText).toContain("Autorizado Test");
      expect(allText).toContain("Nota importante");
    });

    it("should use autotable for equipment rows", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(doc.autoTable).toHaveBeenCalled();
      const tableCall = doc.autoTable.mock.calls[0][0];
      expect(tableCall.head[0]).toContain("Elemento");
      expect(tableCall.body[0][4]).toBe("Reflector");
    });

    it("should handle empty equipment gracefully", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.querySelector('input[name="equipo-tipo"]').value = "";
      document.querySelector('input[name="equipo-cantidad"]').value = "";
      document.querySelector('input[name="equipo-codigo"]').value = "";
      document.querySelector('input[name="equipo-elemento"]').value = "";

      document.getElementById("btn-pdf").click();
      expect(doc.autoTable).not.toHaveBeenCalled();
    });
  });

  describe("PDF branch coverage", () => {
    it("should handle missing observaciones", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("observaciones").value = "";

      document.getElementById("btn-pdf").click();
      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("sin observaciones");
    });

    it("should handle no equipment rows in DOM", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();

      const tbody = document.getElementById("equip-tbody");
      tbody.querySelectorAll(".equip-row").forEach((row) => row.remove());

      document.getElementById("btn-pdf").click();
      expect(window.jspdf.jsPDF).toHaveBeenCalledOnce();
      expect(doc.save).toHaveBeenCalledWith(
        "F3-Solicitud-Bodega-Arte.pdf",
      );
    });

    it("should handle empty tipo-documento via generateF3PDF", async () => {
      const { generateF3PDF } = await import("../../../js/forms/f3/f3-pdf.js");
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("tipo-documento").value = "";

      generateF3PDF(() => []);

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).not.toContain("CC");
      expect(doc.save).toHaveBeenCalledWith("F3-Solicitud-Bodega-Arte.pdf");
    });

    it("should use fallback text via direct generateF3PDF call", async () => {
      const { generateF3PDF } = await import("../../../js/forms/f3/f3-pdf.js");
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("proyecto").value = "";

      generateF3PDF(() => []);

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("(sin especificar)");
    });

    it("should handle multiple equipment rows in PDF", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("add-equip-btn").click();
      const rows = document.querySelectorAll(".equip-row");
      rows[1].querySelector('input[name="equipo-tipo"]').value = "Sonido";
      rows[1].querySelector('input[name="equipo-cantidad"]').value = "1";
      rows[1].querySelector('input[name="equipo-codigo"]').value = "COD-002";
      rows[1].querySelector('input[name="equipo-elemento"]').value = "Micrófono";
      rows[0].querySelector('input[name="equipo-item"]').value = "1";
      rows[1].querySelector('input[name="equipo-item"]').value = "2";

      document.getElementById("btn-pdf").click();
      expect(doc.autoTable).toHaveBeenCalled();
      expect(doc.autoTable.mock.calls[0][0].body.length).toBe(2);
    });
  });
});
