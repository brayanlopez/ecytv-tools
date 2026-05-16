import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("../../../js/forms/common/io-config.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    importFromFile: vi.fn(),
  };
});

describe("F3 IO handlers", () => {
  let handleExportJSON;
  let handleExportYAML;
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
      <form id="f3-form">
        <input type="text" id="proyecto" value="Proyecto Test" />
        <input type="text" id="asignatura" value="Dirección de Arte" />
        <input type="text" id="docente" value="Docente Test" />
        <input type="text" id="autorizado" value="Autorizado Test" />
        <select id="tipo-documento"><option value="CC" selected>CC</option></select>
        <input type="text" id="numero-documento" value="123456789" />
        <input type="text" id="tiun" value="TIUN123" />
        <input type="tel" id="celular" value="3001234567" />
        <input type="text" id="lugar" value="Estudio" />
        <input type="datetime-local" id="fecha-retiro" value="2026-01-01T10:00" />
        <input type="datetime-local" id="fecha-entrega" value="2026-01-01T12:00" />
        <input type="checkbox" id="mismo-dia" />
        <textarea id="observaciones">Obs test</textarea>
        <table><tbody id="equip-tbody">
          <tr class="equip-row">
            <td><input type="text" name="equipo-item" value="1" /></td>
            <td><input type="text" name="equipo-tipo" value="Iluminación" /></td>
            <td><input type="number" name="equipo-cantidad" value="2" /></td>
            <td><input type="text" name="equipo-codigo" value="COD-001" /></td>
            <td><input type="text" name="equipo-elemento" value="Reflector" /></td>
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
      const module = await import("../../../js/forms/f3/f3-io.js");
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
      const module = await import("../../../js/forms/f3/f3-io.js");
      handleExportYAML = module.handleExportYAML;

      const tbody = document.getElementById("equip-tbody");
      await handleExportYAML(tbody);

      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en YAML correctamente.",
        "success",
      );
    });
  });
});

describe("handleImport (F3)", () => {
  let handleImport;
  let snackbarSpy;

  beforeEach(async () => {
    vi.resetModules();

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    snackbarSpy = vi.fn();
    window.EcytvUI = { showSnackbar: snackbarSpy };
    Element.prototype.scrollIntoView = vi.fn();

    document.body.innerHTML = `
      <form id="f3-form">
        <input type="text" id="proyecto" />
        <input type="text" id="asignatura" />
        <input type="text" id="docente" />
        <input type="text" id="autorizado" />
        <select id="tipo-documento">
          <option value="">Seleccionar...</option>
          <option value="CC">CC</option>
        </select>
        <input type="text" id="numero-documento" />
        <input type="text" id="tiun" />
        <input type="tel" id="celular" />
        <input type="text" id="lugar" />
        <input type="datetime-local" id="fecha-retiro" />
        <input type="datetime-local" id="fecha-entrega" />
        <input type="checkbox" id="mismo-dia" />
        <textarea id="observaciones"></textarea>
        <table><tbody id="equip-tbody">
          <tr class="equip-row">
            <td><input type="text" name="equipo-item" /></td>
            <td><input type="text" name="equipo-tipo" /></td>
            <td><input type="number" name="equipo-cantidad" /></td>
            <td><input type="text" name="equipo-codigo" /></td>
            <td><input type="text" name="equipo-elemento" /></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody></table>
      </form>
    `;

    const mod = await import("../../../js/forms/f3/f3-io.js");
    handleImport = mod.handleImport;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("should show error snackbar when import fails", async () => {
    const ioConfig = await import("../../../js/forms/common/io-config.js");
    ioConfig.importFromFile.mockRejectedValue(
      new Error("Formato de archivo no válido. Usa JSON o YAML."),
    );

    const tbody = document.getElementById("equip-tbody");
    const form = document.getElementById("f3-form");
    await handleImport(tbody, form);

    expect(snackbarSpy).toHaveBeenCalledWith(
      "Formato de archivo no válido. Usa JSON o YAML.",
      "error",
    );
  });

  it("should show success snackbar when import succeeds", async () => {
    const ioConfig = await import("../../../js/forms/common/io-config.js");
    ioConfig.importFromFile.mockResolvedValue({
      proyecto: "Proyecto Restaurado",
      autorizado: "Autorizado Test",
      "tipo-documento": "CC",
    });

    const tbody = document.getElementById("equip-tbody");
    const form = document.getElementById("f3-form");
    await handleImport(tbody, form);

    expect(document.getElementById("proyecto").value).toBe("Proyecto Restaurado");
    expect(document.getElementById("autorizado").value).toBe("Autorizado Test");
    expect(document.getElementById("tipo-documento").value).toBe("CC");
    expect(snackbarSpy).toHaveBeenCalledWith(
      "Datos importados correctamente.",
      "success",
    );
  });
});

describe("restoreFormData (F3)", () => {
  let restoreFormData;

  beforeEach(async () => {
    vi.resetModules();
    Element.prototype.scrollIntoView = vi.fn();
    document.body.innerHTML = `
      <form id="f3-form">
        <input type="text" id="proyecto" />
        <input type="text" id="asignatura" />
        <input type="text" id="docente" />
        <input type="text" id="autorizado" />
        <select id="tipo-documento">
          <option value="">Seleccionar...</option>
          <option value="CC">CC</option>
          <option value="CE">CE</option>
        </select>
        <input type="text" id="numero-documento" />
        <input type="text" id="tiun" />
        <input type="tel" id="celular" />
        <input type="text" id="lugar" />
        <input type="datetime-local" id="fecha-retiro" />
        <input type="datetime-local" id="fecha-entrega" />
        <input type="checkbox" id="mismo-dia" />
        <textarea id="observaciones"></textarea>
        <table><tbody id="equip-tbody">
          <tr class="equip-row">
            <td><input type="text" name="equipo-item" /></td>
            <td><input type="text" name="equipo-tipo" /></td>
            <td><input type="number" name="equipo-cantidad" /></td>
            <td><input type="text" name="equipo-codigo" /></td>
            <td><input type="text" name="equipo-elemento" /></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody></table>
      </form>
    `;
    const module = await import("../../../js/forms/f3/f3-data.js");
    restoreFormData = module.restoreFormData;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("should restore simple fields from data", () => {
    const data = {
      proyecto: "Proyecto Restaurado",
      asignatura: "Dirección de Arte",
      docente: "Docente Restaurado",
      autorizado: "Autorizado Test",
    };

    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);

    expect(document.getElementById("proyecto").value).toBe("Proyecto Restaurado");
    expect(document.getElementById("asignatura").value).toBe("Dirección de Arte");
    expect(document.getElementById("docente").value).toBe("Docente Restaurado");
    expect(document.getElementById("autorizado").value).toBe("Autorizado Test");
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
        { item: "1", tipo: "Iluminación", cantidad: "2", codigo: "COD-001", elemento: "Reflector" },
        { item: "2", tipo: "Sonido", cantidad: "1", codigo: "COD-002", elemento: "Micrófono" },
      ],
    };

    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".equip-row");
    expect(rows).toHaveLength(2);

    const firstInputs = rows[0].querySelectorAll("input");
    expect(firstInputs[0].value).toBe("1");
    expect(firstInputs[1].value).toBe("Iluminación");
    expect(firstInputs[2].value).toBe("2");
    expect(firstInputs[3].value).toBe("COD-001");
    expect(firstInputs[4].value).toBe("Reflector");
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

  it("should handle missing element IDs gracefully", () => {
    const data = { "non-existent-id": "value" };
    const tbody = document.getElementById("equip-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });

  it("should not throw when form is not provided", () => {
    const data = { proyecto: "Test" };
    const tbody = document.getElementById("equip-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });

  it("should handle undefined values", () => {
    const data = { proyecto: undefined };
    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);
    expect(document.getElementById("proyecto").value).toBe("");
  });

  it("should remove an added equipment row via its remove button", () => {
    const data = {
      equipos: [
        { item: "1", tipo: "Iluminación", cantidad: "2", codigo: "COD-001", elemento: "Reflector" },
        { item: "2", tipo: "Sonido", cantidad: "1", codigo: "COD-002", elemento: "Micrófono" },
      ],
    };

    const tbody = document.getElementById("equip-tbody");
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".equip-row");
    expect(rows).toHaveLength(2);

    const removeBtns = tbody.querySelectorAll(".btn-remove-equip");
    removeBtns[1].click();

    const remainingRows = tbody.querySelectorAll(".equip-row");
    expect(remainingRows).toHaveLength(1);
  });

  it("should handle missing DOM elements gracefully", () => {
    const proyecto = document.getElementById("proyecto");
    proyecto.remove();

    const data = { proyecto: "Should skip silently" };
    const tbody = document.getElementById("equip-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });

  it("should handle missing first equipment row", () => {
    const tbody = document.getElementById("equip-tbody");
    tbody.innerHTML = "";

    const data = {
      equipos: [
        { item: "1", tipo: "Iluminación", cantidad: "2", codigo: "COD-001", elemento: "Reflector" },
      ],
    };
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".equip-row");
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelector('input[name="equipo-tipo"]').value).toBe("Iluminación");
  });

  it("should handle missing checkbox DOM element in setChecked", () => {
    const mismoDia = document.getElementById("mismo-dia");
    mismoDia.remove();

    const data = { "mismo-dia": true };
    const tbody = document.getElementById("equip-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });
});
