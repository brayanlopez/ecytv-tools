import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F2 PDF Generation", () => {
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
        <form id="f2-form" onsubmit="return false;">
          <div class="form-card">
            <h2>Datos del Responsable</h2>
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="nombre" required placeholder="Nombre completo" />
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
            <div class="form-row full">
              <div class="form-group">
                <input type="tel" id="contacto" required placeholder="Número de contacto" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <h2>Período del Préstamo</h2>
            <div class="form-row">
              <div class="form-group">
                <input type="date" id="periodo-inicial" required />
              </div>
              <div class="form-group">
                <input type="date" id="periodo-final" required />
              </div>
            </div>
          </div>
          <div class="form-card">
            <h2>Fecha de Constancia</h2>
            <div class="form-row full">
              <div class="form-group">
                <input type="date" id="fecha-constancia" required />
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group checkbox-group">
                <input type="checkbox" id="firma-nombre" />
                <label for="firma-nombre">Poner nombre como firma del directo responsable</label>
              </div>
            </div>
          </div>
          <div class="form-card">
            <h2>Observaciones</h2>
            <div class="form-row full">
              <div class="form-group">
                <textarea id="observaciones" placeholder="Observaciones adicionales..."></textarea>
              </div>
            </div>
          </div>
          <div class="form-card" id="history-card" style="display:none">
            <h2>Historial de Actas</h2>
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

    await import("../../../js/forms/f2/f2-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fillAllRequiredF2() {
    document.getElementById("nombre").value = "Juan Pérez";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("contacto").value = "3001234567";
    document.getElementById("periodo-inicial").value = "2026-01-01";
    document.getElementById("periodo-final").value = "2026-02-01";
    document.getElementById("fecha-constancia").value = "2026-01-15";
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
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      expect(window.jspdf.jsPDF).toHaveBeenCalledOnce();
      expect(doc.save).toHaveBeenCalledWith("F2-Acta-Compromiso.pdf");
    });

    it("should show alert when jsPDF is not loaded", () => {
      window.jspdf = undefined;
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
        "Error al cargar la librería PDF. Verifica tu conexión a internet.",
        "error",
      );
    });

    it("should include name and document in the PDF body", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();
      document.getElementById("observaciones").value = "Nota adicional";

      document.getElementById("btn-pdf").click();

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Juan Pérez");
      expect(allText).toContain("CC. 123456789");
      expect(allText).toContain("Nota adicional");
    });

    it("should include period and constancia dates in the PDF", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Periodo del prestamo");
      expect(allText).toContain("Fecha de constancia");
      expect(allText).toContain("Firma del directo responsable");
      expect(allText).toContain("Numero de contacto");
    });

    it("should render name as signature when firma checkbox is checked", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();
      document.getElementById("firma-nombre").checked = true;

      document.getElementById("btn-pdf").click();

      expect(doc.line.mock.calls.length).toBeGreaterThan(0);
      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Juan Pérez");
    });

    it("should render signature line without name when firma unchecked", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();
      document.getElementById("firma-nombre").checked = false;

      document.getElementById("btn-pdf").click();

      expect(doc.line).toHaveBeenCalled();
    });
  });

  describe("formatDate", () => {
    it("should format a date string correctly", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("1 de enero");
      expect(allText).toContain("1 de febrero");
      expect(allText).toContain("15 de enero");
    });

    it("should handle empty date gracefully", () => {
      mockJspdfEnv();
      fillAllRequiredF2();
      document.getElementById("periodo-inicial").value = "";
      document.getElementById("periodo-final").value = "";
      document.getElementById("fecha-constancia").value = "";

      expect(() => {
        document.getElementById("btn-pdf").click();
      }).not.toThrow();
    });
  });

  describe("PDF additional branches", () => {
    it("should handle empty tipo-documento with documento number", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();
      document.getElementById("tipo-documento").removeAttribute("required");
      document.getElementById("tipo-documento").value = "";
      document.getElementById("numero-documento").value = "123456789";

      document.getElementById("btn-pdf").click();
      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("123456789");
    });

    it("should handle empty contacto gracefully", () => {
      const doc = mockJspdfEnv();
      fillAllRequiredF2();
      document.getElementById("contacto").removeAttribute("required");
      document.getElementById("contacto").value = "";

      document.getElementById("btn-pdf").click();
      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("sin especificar");
    });
  });
});
