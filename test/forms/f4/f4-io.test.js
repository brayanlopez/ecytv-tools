import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("../../../js/forms/common/io-config.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    importFromFile: vi.fn(),
  };
});

describe("F4 IO handlers", () => {
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
      <form id="f4-form">
        <input type="text" id="proyecto" value="Proyecto Test" />
        <input type="text" id="asignatura" value="Dirección de Arte" />
        <input type="text" id="docente" value="Docente Test" />
        <input type="text" id="directo-responsable" value="Responsable Test" />
        <select id="tipo-documento"><option value="CC" selected>CC</option></select>
        <input type="text" id="numero-documento" value="123456789" />
        <input type="text" id="tiun" value="TIUN123" />
        <textarea id="observaciones">Obs test</textarea>
        <table><tbody id="sala-tbody">
          <tr class="sala-row">
            <td><input type="text" name="sala-nombre" value="Sala NL1" /></td>
            <td><input type="date" name="sala-fecha" value="2026-06-01" /></td>
            <td><input type="time" name="sala-hora-inicio" value="08:00" /></td>
            <td><input type="time" name="sala-hora-fin" value="10:00" /></td>
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
      const module = await import("../../../js/forms/f4/f4-io.js");
      handleExportJSON = module.handleExportJSON;

      const tbody = document.getElementById("sala-tbody");
      await handleExportJSON(tbody);

      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en JSON correctamente.",
        "success",
      );
    });
  });

  describe("handleExportYAML", () => {
    it("should call showSnackbar with success message", async () => {
      const module = await import("../../../js/forms/f4/f4-io.js");
      handleExportYAML = module.handleExportYAML;

      const tbody = document.getElementById("sala-tbody");
      await handleExportYAML(tbody);

      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en YAML correctamente.",
        "success",
      );
    });
  });
});

describe("handleImport (F4)", () => {
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
      <form id="f4-form">
        <input type="text" id="proyecto" />
        <input type="text" id="asignatura" />
        <input type="text" id="docente" />
        <input type="text" id="directo-responsable" />
        <select id="tipo-documento">
          <option value="">Seleccionar...</option>
          <option value="CC">CC</option>
        </select>
        <input type="text" id="numero-documento" />
        <input type="text" id="tiun" />
        <textarea id="observaciones"></textarea>
        <table><tbody id="sala-tbody">
          <tr class="sala-row">
            <td><input type="text" name="sala-nombre" /></td>
            <td><input type="date" name="sala-fecha" /></td>
            <td><input type="time" name="sala-hora-inicio" /></td>
            <td><input type="time" name="sala-hora-fin" /></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody></table>
      </form>
    `;

    const mod = await import("../../../js/forms/f4/f4-io.js");
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

    const tbody = document.getElementById("sala-tbody");
    const form = document.getElementById("f4-form");
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
      "directo-responsable": "Responsable Test",
      "tipo-documento": "CC",
    });

    const tbody = document.getElementById("sala-tbody");
    const form = document.getElementById("f4-form");
    await handleImport(tbody, form);

    expect(document.getElementById("proyecto").value).toBe(
      "Proyecto Restaurado",
    );
    expect(document.getElementById("directo-responsable").value).toBe(
      "Responsable Test",
    );
    expect(document.getElementById("tipo-documento").value).toBe("CC");
    expect(snackbarSpy).toHaveBeenCalledWith(
      "Datos importados correctamente.",
      "success",
    );
  });
});

describe("restoreFormData (F4)", () => {
  let restoreFormData;

  beforeEach(async () => {
    vi.resetModules();
    Element.prototype.scrollIntoView = vi.fn();
    document.body.innerHTML = `
      <form id="f4-form">
        <input type="text" id="proyecto" />
        <input type="text" id="asignatura" />
        <input type="text" id="docente" />
        <input type="text" id="directo-responsable" />
        <select id="tipo-documento">
          <option value="">Seleccionar...</option>
          <option value="CC">CC</option>
          <option value="CE">CE</option>
        </select>
        <input type="text" id="numero-documento" />
        <input type="text" id="tiun" />
        <textarea id="observaciones"></textarea>
        <table><tbody id="sala-tbody">
          <tr class="sala-row">
            <td><input type="text" name="sala-nombre" /></td>
            <td><input type="date" name="sala-fecha" /></td>
            <td><input type="time" name="sala-hora-inicio" /></td>
            <td><input type="time" name="sala-hora-fin" /></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody></table>
      </form>
    `;
    const module = await import("../../../js/forms/f4/f4-data.js");
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
      "directo-responsable": "Responsable Test",
    };

    const tbody = document.getElementById("sala-tbody");
    restoreFormData(data, tbody);

    expect(document.getElementById("proyecto").value).toBe(
      "Proyecto Restaurado",
    );
    expect(document.getElementById("asignatura").value).toBe(
      "Dirección de Arte",
    );
    expect(document.getElementById("docente").value).toBe("Docente Restaurado");
    expect(document.getElementById("directo-responsable").value).toBe(
      "Responsable Test",
    );
  });

  it("should restore sala rows", () => {
    const data = {
      proyecto: "Test",
      salas: [
        {
          nombre: "Sala NL1",
          fecha: "2026-06-01",
          "hora-inicio": "08:00",
          "hora-fin": "10:00",
        },
        {
          nombre: "Sala NL2",
          fecha: "2026-06-02",
          "hora-inicio": "14:00",
          "hora-fin": "16:00",
        },
      ],
    };

    const tbody = document.getElementById("sala-tbody");
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".sala-row");
    expect(rows).toHaveLength(2);

    const firstInputs = rows[0].querySelectorAll("input");
    expect(firstInputs[0].value).toBe("Sala NL1");
    expect(firstInputs[1].value).toBe("2026-06-01");
    expect(firstInputs[2].value).toBe("08:00");
    expect(firstInputs[3].value).toBe("10:00");
  });

  it("should do nothing when data is null", () => {
    const tbody = document.getElementById("sala-tbody");
    expect(() => restoreFormData(null, tbody)).not.toThrow();
  });

  it("should handle missing salas field gracefully", () => {
    const data = { proyecto: "Test" };
    const tbody = document.getElementById("sala-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });

  it("should handle missing element IDs gracefully", () => {
    const data = { proyecto: "Test", "non-existent-id": "value" };
    const tbody = document.getElementById("sala-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });

  it("should not throw when form is not provided", () => {
    const data = { proyecto: "Test" };
    const tbody = document.getElementById("sala-tbody");
    expect(() => restoreFormData(data, tbody)).not.toThrow();
  });

  it("should handle undefined values", () => {
    const data = { proyecto: undefined };
    const tbody = document.getElementById("sala-tbody");
    restoreFormData(data, tbody);
    expect(document.getElementById("proyecto").value).toBe("");
  });

  it("should clean extra rows from tbody before restoring", () => {
    const tbody = document.getElementById("sala-tbody");
    const extraRow = document.createElement("tr");
    extraRow.className = "sala-row";
    extraRow.innerHTML =
      '<td><input name="sala-nombre" value="Old" /></td><td></td><td></td><td></td><td></td>';
    tbody.appendChild(extraRow);
    expect(tbody.querySelectorAll(".sala-row")).toHaveLength(2);

    const data = {
      proyecto: "Test",
      salas: [
        {
          nombre: "New Sala",
          fecha: "2026-07-01",
          "hora-inicio": "09:00",
          "hora-fin": "11:00",
        },
      ],
    };
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".sala-row");
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelector('input[name="sala-nombre"]').value).toBe(
      "New Sala",
    );
  });

  it("should restore salas with empty field values", () => {
    const tbody = document.getElementById("sala-tbody");
    const data = {
      proyecto: "Test",
      salas: [{ nombre: "", fecha: "", "hora-inicio": "", "hora-fin": "" }],
    };
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".sala-row");
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelector('input[name="sala-nombre"]').value).toBe("");
  });

  it("should support removing dynamically created rows after restore", () => {
    const data = {
      proyecto: "Test",
      salas: [
        {
          nombre: "Sala NL1",
          fecha: "2026-06-01",
          "hora-inicio": "08:00",
          "hora-fin": "10:00",
        },
        {
          nombre: "Sala NL2",
          fecha: "2026-06-02",
          "hora-inicio": "14:00",
          "hora-fin": "16:00",
        },
      ],
    };
    const tbody = document.getElementById("sala-tbody");
    restoreFormData(data, tbody);

    const rows = tbody.querySelectorAll(".sala-row");
    expect(rows).toHaveLength(2);

    const removeBtns = tbody.querySelectorAll(".btn-remove-equip");
    removeBtns[1].click();
    expect(tbody.querySelectorAll(".sala-row")).toHaveLength(1);
  });
});
