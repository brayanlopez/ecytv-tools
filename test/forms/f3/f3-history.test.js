import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F3 History", () => {
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

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("asignatura").value = "Dirección de Arte";

      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorageMock["f3-history"]);
      expect(stored).toHaveLength(1);
      expect(stored[0].data.proyecto).toBe("Proyecto Test");

      document.getElementById("proyecto").value = "";
      document.getElementById("autorizado").value = "";
      document.getElementById("asignatura").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("proyecto").value).toBe("Proyecto Test");
      expect(document.getElementById("autorizado").value).toBe(
        "Autorizado Test",
      );
      expect(document.getElementById("asignatura").value).toBe(
        "Dirección de Arte",
      );
    });

    it("should delete history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("btn-save").click();

      expect(JSON.parse(localStorageMock["f3-history"])).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorageMock["f3-history"])).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe(
        "none",
      );
    });

    it("should limit history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("proyecto").value = "Proyecto " + i;
        document.getElementById("autorizado").value = "Autorizado " + i;
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorageMock["f3-history"]);
      expect(stored).toHaveLength(20);
    });
  });

  describe("getHistoryManager", () => {
    it("should return the history manager instance", async () => {
      const f3History = await import("../../../js/forms/f3/f3-history.js");
      const mgr = f3History.getHistoryManager();
      expect(mgr).toBeDefined();
      expect(typeof mgr.load).toBe("function");
      expect(typeof mgr.addEntry).toBe("function");
      expect(typeof mgr.removeEntry).toBe("function");
    });
  });

  describe("History restore edge cases", () => {
    it("should handle mismo-dia state during restore", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
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

    it("should restore multiple equipment rows from history", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("add-equip-btn").click();
      const rows = document.querySelectorAll(".equip-row");
      rows[0].querySelector('input[name="equipo-tipo"]').value = "Iluminación";
      rows[0].querySelector('input[name="equipo-cantidad"]').value = "2";
      rows[0].querySelector('input[name="equipo-codigo"]').value = "COD-001";
      rows[0].querySelector('input[name="equipo-elemento"]').value = "Reflector";
      rows[1].querySelector('input[name="equipo-tipo"]').value = "Sonido";
      rows[1].querySelector('input[name="equipo-cantidad"]').value = "1";
      rows[1].querySelector('input[name="equipo-codigo"]').value = "COD-002";
      rows[1].querySelector('input[name="equipo-elemento"]').value = "Micrófono";

      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      document.getElementById("autorizado").value = "";

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      const restoredRows = document.querySelectorAll(".equip-row");
      expect(restoredRows).toHaveLength(2);
      expect(restoredRows[1].querySelector('input[name="equipo-tipo"]').value).toBe("Sonido");
    });

    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("autorizado").value = "Test";
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
