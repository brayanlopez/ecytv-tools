import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F4 History", () => {
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

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("asignatura").value = "Dirección de Arte";

      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorageMock["f4-history"]);
      expect(stored).toHaveLength(1);
      expect(stored[0].data.proyecto).toBe("Proyecto Test");

      document.getElementById("proyecto").value = "";
      document.getElementById("directo-responsable").value = "";
      document.getElementById("asignatura").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("proyecto").value).toBe("Proyecto Test");
      expect(document.getElementById("directo-responsable").value).toBe(
        "Responsable Test",
      );
      expect(document.getElementById("asignatura").value).toBe(
        "Dirección de Arte",
      );
    });

    it("should delete history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("btn-save").click();

      expect(JSON.parse(localStorageMock["f4-history"])).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorageMock["f4-history"])).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe(
        "none",
      );
    });

    it("should return history manager via getHistoryManager", async () => {
      const { getHistoryManager } =
        await import("../../../js/forms/f4/f4-history.js");
      const mgr = getHistoryManager();
      expect(mgr).toBeDefined();
      expect(typeof mgr.addEntry).toBe("function");
    });

    it("should limit history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("proyecto").value = "Proyecto " + i;
        document.getElementById("directo-responsable").value =
          "Responsable " + i;
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorageMock["f4-history"]);
      expect(stored).toHaveLength(20);
    });
  });

  describe("History restore edge cases", () => {
    it("should restore sala rows from history", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
      document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
      document.querySelector('input[name="sala-hora-fin"]').value = "10:00";
      document.getElementById("add-sala-btn").click();
      const rows = document.querySelectorAll(".sala-row");
      rows[1].querySelector('input[name="sala-nombre"]').value = "Sala NL2";
      rows[1].querySelector('input[name="sala-fecha"]').value = "2026-06-02";
      rows[1].querySelector('input[name="sala-hora-inicio"]').value = "14:00";
      rows[1].querySelector('input[name="sala-hora-fin"]').value = "16:00";

      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      document.querySelector('input[name="sala-nombre"]').value = "";

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.querySelector('input[name="sala-nombre"]').value).toBe(
        "Sala NL1",
      );
      const restoredRows = document.querySelectorAll(".sala-row");
      expect(restoredRows).toHaveLength(2);
    });

    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("directo-responsable").value = "Test";
      document.getElementById("btn-save").click();

      expect(() => {
        const restoreBtns = document.querySelectorAll(".btn-history-restore");
        if (restoreBtns.length > 0) {
          restoreBtns[0].dataset.id = "nonexistent";
          restoreBtns[0].click();
        }
      }).not.toThrow();
    });

    it("should clean extra rows before restoring from history", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("btn-save").click();

      const tbody = document.getElementById("sala-tbody");
      const extraRow = document.createElement("tr");
      extraRow.className = "sala-row";
      extraRow.innerHTML =
        '<td><input name="sala-nombre" value="Dirty" /></td><td></td><td></td><td></td><td></td>';
      tbody.appendChild(extraRow);
      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(2);

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(1);
    });

    it("should remove dynamically restored sala rows via their own button", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
      document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
      document.querySelector('input[name="sala-hora-fin"]').value = "10:00";
      document.getElementById("add-sala-btn").click();
      const rows = document.querySelectorAll(".sala-row");
      rows[1].querySelector('input[name="sala-nombre"]').value = "Sala NL2";
      rows[1].querySelector('input[name="sala-fecha"]').value = "2026-06-02";
      rows[1].querySelector('input[name="sala-hora-inicio"]').value = "14:00";
      rows[1].querySelector('input[name="sala-hora-fin"]').value = "16:00";
      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      const tbody = document.getElementById("sala-tbody");
      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(2);
      const removeBtns = tbody.querySelectorAll(".btn-remove-equip");
      removeBtns[1].click();
      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(1);
    });
  });
});
