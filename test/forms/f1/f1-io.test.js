import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F1 IO handlers", () => {
  let handleExportJSON;
  let handleExportYAML;
  let handleImport;
  let snackbarSpy;

  beforeEach(async () => {
    vi.resetModules();

    snackbarSpy = vi.fn();
    window.EcytvUI = { showSnackbar: snackbarSpy };

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    vi.spyOn(document.body, "removeChild").mockImplementation(() => {});

    document.body.innerHTML = `
      <form id="f1-form">
        <input type="text" id="proyecto" value="Proyecto Test" />
        <input type="text" id="asignatura" value="Sonido I" />
        <input type="text" id="docente" value="Docente Test" />
        <input type="text" id="responsable" value="Responsable Test" />
        <input type="tel" id="celular" value="1234567890" />
        <input type="text" id="tiun" value="TIUN123" />
        <input type="text" id="lugar" value="Estudio" />
        <select id="tipo-prestamo"><option value="Interno" selected>Interno</option></select>
        <input type="datetime-local" id="fecha-retiro" value="2026-01-01T10:00" />
        <input type="datetime-local" id="fecha-entrega" value="2026-01-01T12:00" />
        <input type="checkbox" id="mismo-dia" />
        <textarea id="observaciones">Obs test</textarea>
        <table><tbody id="equip-tbody">
          <tr class="equip-row">
            <td><input type="text" name="equipo-item" value="1" /></td>
            <td><input type="text" name="equipo-nombre" value="Cámara" /></td>
            <td><input type="text" name="equipo-consecutivo" value="CON-001" /></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody></table>
      </form>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("handleExportJSON", () => {
    it("should call showSnackbar with success message", async () => {
      const module = await import("../../../js/forms/f1/f1-io.js");
      handleExportJSON = module.handleExportJSON;

      const tbody = document.getElementById("equip-tbody");
      await handleExportJSON(tbody);

      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en JSON correctamente.",
        "success",
      );
    });
  });

  describe("handleExportYAML", () => {
    it("should call showSnackbar with success message", async () => {
      const module = await import("../../../js/forms/f1/f1-io.js");
      handleExportYAML = module.handleExportYAML;

      const tbody = document.getElementById("equip-tbody");
      await handleExportYAML(tbody);

      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en YAML correctamente.",
        "success",
      );
    });
  });

  describe("handleImport", () => {
    it("should show error snackbar when file reading fails", async () => {
      const mockInput = document.createElement("input");
      let changeHandler = null;
      vi.spyOn(mockInput, "addEventListener").mockImplementation((event, handler) => {
        if (event === "change") changeHandler = handler;
      });
      vi.spyOn(document, "createElement").mockReturnValue(mockInput);

      const module = await import("../../../js/forms/f1/f1-io.js");
      handleImport = module.handleImport;

      const tbody = document.getElementById("equip-tbody");
      const form = document.getElementById("f1-form");
      const promise = handleImport(tbody, form);

      if (changeHandler) {
        const mockEvent = {
          target: {
            files: [
              Object.assign(new File([""], "bad.json", { type: "application/json" }), {
                text: () => Promise.reject(new Error("fail")),
              }),
            ],
          },
        };
        await changeHandler(mockEvent);
      }

      await vi.waitFor(() => {
        expect(snackbarSpy).toHaveBeenCalledWith(
          "Formato de archivo no válido. Usa JSON o YAML.",
          "error",
        );
      });
    });
  });
});

describe("restoreFormData (F1)", () => {
  let restoreFormData;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = `
      <form id="f1-form">
        <input type="text" id="proyecto" />
        <input type="text" id="asignatura" />
        <input type="text" id="docente" />
        <input type="text" id="responsable" />
        <input type="tel" id="celular" />
        <input type="text" id="tiun" />
        <input type="text" id="lugar" />
        <select id="tipo-prestamo">
          <option value="">Seleccionar...</option>
          <option value="Interno">Interno</option>
          <option value="Externo">Externo</option>
        </select>
        <input type="datetime-local" id="fecha-retiro" />
        <input type="datetime-local" id="fecha-entrega" />
        <input type="checkbox" id="mismo-dia" />
        <textarea id="observaciones"></textarea>
        <table><tbody id="equip-tbody">
          <tr class="equip-row">
            <td><input type="text" name="equipo-item" /></td>
            <td><input type="text" name="equipo-nombre" /></td>
            <td><input type="text" name="equipo-consecutivo" /></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody></table>
      </form>
    `;
    const module = await import("../../../js/forms/f1/f1-data.js");
    restoreFormData = module.restoreFormData;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("should restore simple fields from data", () => {
    const data = {
      proyecto: "Proyecto Restaurado",
      asignatura: "Sonido II",
      docente: "Docente Restaurado",
      responsable: "Responsable",
    };

    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);

    expect(document.getElementById("proyecto").value).toBe("Proyecto Restaurado");
    expect(document.getElementById("asignatura").value).toBe("Sonido II");
    expect(document.getElementById("docente").value).toBe("Docente Restaurado");
  });

  it("should restore checkbox estado", () => {
    const data = { "mismo-dia": true, "fecha-retiro": "2026-05-01T10:00" };

    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);

    expect(document.getElementById("mismo-dia").checked).toBe(true);
  });

  it("should restore equipment rows", () => {
    const data = {
      equipos: [
        { item: "1", nombre: "Cámara Sony", consecutivo: "CON-001" },
        { item: "2", nombre: "Trípode", consecutivo: "CON-002" },
      ],
    };

    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".equip-row");
    expect(rows).toHaveLength(2);

    const firstInputs = rows[0].querySelectorAll("input");
    expect(firstInputs[0].value).toBe("1");
    expect(firstInputs[1].value).toBe("Cámara Sony");
    expect(firstInputs[2].value).toBe("CON-001");
  });

  it("should do nothing when data is null", () => {
    const tbody = document.getElementById("equip-tbody");
    expect(() => restoreFormData(null, tbody)).not.toThrow();
  });

  it("should handle missing equipos field gracefully", () => {
    const data = { proyecto: "Test" };
    const tbody = document.getElementById("equip-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });
});
