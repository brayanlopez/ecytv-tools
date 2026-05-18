import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F2 PDF Generation", () => {
  let localStorageMock;
  let originalFetch;

  beforeEach(async () => {
    vi.resetModules();

    originalFetch = globalThis.fetch;

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
            <p class="form-actions-hint">Guarda los datos del formulario en un archivo (JSON o YAML) para volver a cargarlos después con el botón Importar.</p>
          </div>
        </form>
      </main>
    `;

    await import("../../../js/forms/f2/f2-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
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

  function mockPdfLib() {
    const font = { widthOfTextAtSize: vi.fn(() => 50) };
    const page = {
      getSize: vi.fn(() => ({ width: 596, height: 843 })),
      drawText: vi.fn(),
      drawLine: vi.fn(),
      drawRectangle: vi.fn(),
    };
    const doc = {
      getPages: vi.fn(() => [page]),
      embedFont: vi.fn(() => Promise.resolve(font)),
      save: vi.fn(() => Promise.resolve(new Uint8Array())),
    };
    window.PDFLib = {
      PDFDocument: { load: vi.fn(() => Promise.resolve(doc)) },
      rgb: vi.fn(() => ({})),
      StandardFonts: {
        Helvetica: "Helvetica",
        HelveticaBold: "Helvetica-Bold",
      },
    };
    return { doc, page, font };
  }

  function mockTemplateFetch(ok) {
    if (ok === false) {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
    } else {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
      });
    }
  }

  describe("PDF Generation", () => {
    it("should generate PDF when all fields are filled", async () => {
      const { doc } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          expect(window.PDFLib.PDFDocument.load).toHaveBeenCalledOnce();
          expect(doc.save).toHaveBeenCalledOnce();
        },
        { timeout: 5000 },
      );
    });

    it("should show alert when PDFLib is not loaded", () => {
      window.PDFLib = undefined;
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
        "Error al cargar la librería PDF. Verifica tu conexión a internet.",
        "error",
      );
    });

    it("should show alert when template fetch fails", async () => {
      mockPdfLib();
      mockTemplateFetch(false);
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
            "Error al generar el archivo PDF: No se pudo cargar la plantilla PDF",
            "error",
          );
        },
        { timeout: 5000 },
      );
    });

    it("should include name and document in the PDF", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("Juan Pérez");
          expect(allText).toContain("123456789");
        },
        { timeout: 5000 },
      );
    });

    it("should fill period date parts in blanks", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("2026");
          expect(allText).toContain("enero");
          expect(allText).toContain("febrero");
        },
        { timeout: 5000 },
      );
    });

    it("should fill constancia date parts in blanks", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("15");
          expect(allText).toContain("enero");
        },
        { timeout: 5000 },
      );
    });

    it("should render name only once when signature is unchecked", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();
      document.getElementById("firma-nombre").checked = false;

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const nameCalls = page.drawText.mock.calls.filter((c) => String(c[0]) === "Juan Pérez");
          expect(nameCalls).toHaveLength(1);
        },
        { timeout: 5000 },
      );
    });

    it("should render name twice when signature is checked", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();
      document.getElementById("firma-nombre").checked = true;

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const nameCalls = page.drawText.mock.calls.filter((c) => String(c[0]) === "Juan Pérez");
          expect(nameCalls).toHaveLength(2);
        },
        { timeout: 5000 },
      );
    });
  });

  describe("Date handling", () => {
    it("should format and display period dates correctly", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("1");
          expect(allText).toContain("enero");
          expect(allText).toContain("febrero");
        },
        { timeout: 5000 },
      );
    });

    it("should handle empty date gracefully", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();
      document.getElementById("periodo-inicial").removeAttribute("required");
      document.getElementById("periodo-final").removeAttribute("required");
      document.getElementById("fecha-constancia").removeAttribute("required");
      document.getElementById("periodo-inicial").value = "";
      document.getElementById("periodo-final").value = "";
      document.getElementById("fecha-constancia").value = "";

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          expect(page.drawText).toHaveBeenCalled();
        },
        { timeout: 5000 },
      );
    });
  });

  describe("PDF additional branches", () => {
    it("should handle empty tipo-documento with documento number", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();
      document.getElementById("tipo-documento").removeAttribute("required");
      document.getElementById("tipo-documento").value = "";
      document.getElementById("numero-documento").value = "123456789";

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("123456789");
        },
        { timeout: 5000 },
      );
    });

    it("should handle non-CC document type by overwriting ciudadanía", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();
      document.getElementById("tipo-documento").value = "CE";

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          expect(page.drawRectangle).toHaveBeenCalled();
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("Extranjería");
        },
        { timeout: 5000 },
      );
    });

    it("should handle empty contacto gracefully", async () => {
      const { page } = mockPdfLib();
      mockTemplateFetch();
      fillAllRequiredF2();
      document.getElementById("contacto").removeAttribute("required");
      document.getElementById("contacto").value = "";

      document.getElementById("btn-pdf").click();

      await vi.waitFor(
        () => {
          const allText = page.drawText.mock.calls.map((c) => String(c[0])).join(" ");
          expect(allText).toContain("sin especificar");
        },
        { timeout: 5000 },
      );
    });
  });
});
