import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("F2 IO handlers", () => {
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

    Element.prototype.scrollIntoView = vi.fn();

    document.body.innerHTML = `
      <form id="f2-form">
        <input type="text" id="nombre" value="Juan Pérez" />
        <select id="tipo-documento"><option value="CC" selected>CC</option></select>
        <input type="text" id="numero-documento" value="12345" />
        <input type="tel" id="contacto" value="3001234567" />
        <input type="date" id="periodo-inicial" value="2026-01-01" />
        <input type="date" id="periodo-final" value="2026-01-15" />
        <input type="date" id="fecha-constancia" value="2026-01-10" />
        <input type="checkbox" id="firma-nombre" checked />
        <textarea id="observaciones">Obs test</textarea>
      </form>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("handleExportJSON", () => {
    it("should call showSnackbar with success message", async () => {
      const module = await import("../../../js/forms/f2/f2-io.js");
      handleExportJSON = module.handleExportJSON;
      await handleExportJSON();
      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en JSON correctamente.",
        "success",
      );
    });
  });

  describe("handleExportYAML", () => {
    it("should call showSnackbar with success message", async () => {
      const module = await import("../../../js/forms/f2/f2-io.js");
      handleExportYAML = module.handleExportYAML;
      await handleExportYAML();
      expect(snackbarSpy).toHaveBeenCalledWith(
        "Datos exportados en YAML correctamente.",
        "success",
      );
    });
  });
});

describe("restoreFormData (F2)", () => {
  let restoreFormData;

  beforeEach(async () => {
    vi.resetModules();
    Element.prototype.scrollIntoView = vi.fn();
    document.body.innerHTML = `
      <form id="f2-form">
        <input type="text" id="nombre" />
        <select id="tipo-documento">
          <option value="">Seleccionar...</option>
          <option value="CC">CC</option>
          <option value="CE">CE</option>
        </select>
        <input type="text" id="numero-documento" />
        <input type="tel" id="contacto" />
        <input type="date" id="periodo-inicial" />
        <input type="date" id="periodo-final" />
        <input type="date" id="fecha-constancia" />
        <input type="checkbox" id="firma-nombre" />
        <textarea id="observaciones"></textarea>
      </form>
    `;
    const module = await import("../../../js/forms/f2/f2-data.js");
    restoreFormData = module.restoreFormData;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("should restore all fields from data", () => {
    const data = {
      nombre: "María García",
      "tipo-documento": "CE",
      "numero-documento": "AB123456",
      contacto: "3019876543",
      "periodo-inicial": "2026-03-01",
      "periodo-final": "2026-03-15",
      "fecha-constancia": "2026-03-10",
      "firma-nombre": true,
      observaciones: "Acta de prueba",
    };

    const form = document.getElementById("f2-form");
    restoreFormData(data, form);

    expect(document.getElementById("nombre").value).toBe("María García");
    expect(document.getElementById("tipo-documento").value).toBe("CE");
    expect(document.getElementById("numero-documento").value).toBe("AB123456");
    expect(document.getElementById("contacto").value).toBe("3019876543");
    expect(document.getElementById("periodo-inicial").value).toBe("2026-03-01");
    expect(document.getElementById("periodo-final").value).toBe("2026-03-15");
    expect(document.getElementById("fecha-constancia").value).toBe("2026-03-10");
    expect(document.getElementById("firma-nombre").checked).toBe(true);
    expect(document.getElementById("observaciones").value).toBe("Acta de prueba");
  });

  it("should set checkbox to false when data has false", () => {
    const data = { "firma-nombre": false };
    const form = document.getElementById("f2-form");
    restoreFormData(data, form);
    expect(document.getElementById("firma-nombre").checked).toBe(false);
  });

  it("should do nothing when data is null", () => {
    const form = document.getElementById("f2-form");
    expect(() => restoreFormData(null, form)).not.toThrow();
  });
});
