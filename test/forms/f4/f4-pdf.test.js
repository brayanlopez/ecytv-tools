import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F4 PDF Generation", () => {
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
            <p class="form-actions-hint">Guarda los datos del formulario en un archivo (JSON o YAML) para volver a cargar los después con el botón Importar.</p>
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
      expect(doc.save).toHaveBeenCalledWith("F4-Solicitud-Salas-Edicion.pdf");
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
      expect(allText).toContain("Responsable Test");
      expect(allText).toContain("Nota importante");
    });

    it("should use autotable for sala rows", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(doc.autoTable).toHaveBeenCalled();
      const tableCall = doc.autoTable.mock.calls[0][0];
      expect(tableCall.head[0]).toContain("Sala");
      expect(tableCall.body[0][0]).toBe("");
    });

    it("should handle empty sala rows gracefully", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.querySelector('input[name="sala-fecha"]').value = "";
      document.querySelector('input[name="sala-hora-inicio"]').value = "";
      document.querySelector('input[name="sala-hora-fin"]').value = "";

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

    it("should handle multiple sala rows in PDF", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.getElementById("add-sala-btn").click();
      const rows = document.querySelectorAll(".sala-row");
      rows[0].querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      rows[1].querySelector('input[name="sala-nombre"]').value = "Sala NL2";
      rows[1].querySelector('input[name="sala-fecha"]').value = "2026-06-02";
      rows[1].querySelector('input[name="sala-hora-inicio"]').value = "14:00";
      rows[1].querySelector('input[name="sala-hora-fin"]').value = "16:00";

      document.getElementById("btn-pdf").click();
      expect(doc.autoTable).toHaveBeenCalled();
      expect(doc.autoTable.mock.calls[0][0].body.length).toBe(2);
    });

    it("should include sala-nombre in autoTable body", () => {
      const doc = mockJspdfEnv();
      fillAllRequired();
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";

      document.getElementById("btn-pdf").click();
      expect(doc.autoTable).toHaveBeenCalled();
      const tableCall = doc.autoTable.mock.calls[0][0];
      expect(tableCall.body[0][0]).toBe("Sala NL1");
    });

    it("should show (sin especificar) for empty tipo-documento in PDF", async () => {
      const { generateF4PDF } = await import("../../../js/forms/f4/f4-pdf.js");
      const doc = mockJspdfEnv();
      document.getElementById("proyecto").value = "";
      document.getElementById("asignatura").value = "";
      document.getElementById("docente").value = "";
      document.getElementById("directo-responsable").value = "";
      document.getElementById("tipo-documento").value = "";
      document.getElementById("numero-documento").value = "";
      document.getElementById("tiun").value = "";

      generateF4PDF(() => []);

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("(sin especificar)");
    });

    it("should show (ninguna) when no sala rows in PDF", async () => {
      const { generateF4PDF } = await import("../../../js/forms/f4/f4-pdf.js");
      const doc = mockJspdfEnv();
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("asignatura").value = "Dirección de Arte";
      document.getElementById("docente").value = "Docente Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("tiun").value = "TIUN123";

      generateF4PDF(() => []);

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("(ninguna)");
      expect(doc.autoTable).not.toHaveBeenCalled();
    });
  });
});
