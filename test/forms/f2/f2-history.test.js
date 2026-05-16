import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F2 History", () => {
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

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("nombre").value = "Juan Pérez";
      document.getElementById("tipo-documento").value = "CC";
      document.getElementById("numero-documento").value = "123456789";
      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorageMock["f2-history"]);
      expect(stored).toHaveLength(1);
      expect(stored[0].data.nombre).toBe("Juan Pérez");

      document.getElementById("nombre").value = "";
      document.getElementById("tipo-documento").value = "";
      document.getElementById("numero-documento").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("nombre").value).toBe("Juan Pérez");
      expect(document.getElementById("tipo-documento").value).toBe("CC");
      expect(document.getElementById("numero-documento").value).toBe(
        "123456789",
      );
    });

    it("should delete history entries", () => {
      document.getElementById("nombre").value = "Juan Pérez";
      document.getElementById("btn-save").click();
      expect(JSON.parse(localStorageMock["f2-history"])).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorageMock["f2-history"])).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe(
        "none",
      );
    });

    it("should limit history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("nombre").value = "Nombre " + i;
        document.getElementById("tipo-documento").value = "CC";
        document.getElementById("numero-documento").value = "Doc" + i;
        document.getElementById("contacto").value = "300" + i;
        document.getElementById("periodo-inicial").value = "2026-01-01";
        document.getElementById("periodo-final").value = "2026-02-01";
        document.getElementById("fecha-constancia").value = "2026-01-15";
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorageMock["f2-history"]);
      expect(stored).toHaveLength(20);
    });

    it("should restore firma-nombre checkbox state", () => {
      document.getElementById("nombre").value = "Juan Pérez";
      document.getElementById("firma-nombre").checked = true;
      document.getElementById("btn-save").click();

      document.getElementById("firma-nombre").checked = false;

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("firma-nombre").checked).toBe(true);
    });
  });

  describe("History restore edge cases", () => {
    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("nombre").value = "Test";
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
