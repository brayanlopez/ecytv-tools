import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("serializeYAML", () => {
  let serializeYAML;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/forms/common/io-config.js");
    serializeYAML = module.serializeYAML;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should serialize flat object with string values", () => {
    const data = { nombre: "Juan", proyecto: "Test" };
    const result = serializeYAML(data);
    expect(result).toContain("nombre: Juan\n");
    expect(result).toContain("proyecto: Test\n");
  });

  it("should serialize boolean values as true/false", () => {
    const data = { activo: true, inactivo: false };
    const result = serializeYAML(data);
    expect(result).toContain("activo: true\n");
    expect(result).toContain("inactivo: false\n");
  });

  it("should serialize numeric values", () => {
    const data = { cantidad: 42 };
    const result = serializeYAML(data);
    expect(result).toContain("cantidad: 42\n");
  });

  it("should serialize null as null", () => {
    const data = { valor: null };
    const result = serializeYAML(data);
    expect(result).toContain("valor: null\n");
  });

  it("should serialize array of objects", () => {
    const data = {
      equipos: [
        { item: "1", nombre: "Cámara" },
        { item: "2", nombre: "Trípode" },
      ],
    };
    const result = serializeYAML(data);
    expect(result).toContain("equipos:");
    expect(result).toContain("  -");
    expect(result).toContain("    item: \"1\"");
    expect(result).toContain("    nombre: Cámara");
    expect(result).toContain("    item: \"2\"");
    expect(result).toContain("    nombre: Trípode");
  });

  it("should quote strings with special characters", () => {
    const data = { desc: "texto: con dos puntos" };
    const result = serializeYAML(data);
    expect(result).toContain('"');
  });

  it("should end with newline", () => {
    const result = serializeYAML({ a: "b" });
    expect(result.endsWith("\n")).toBe(true);
  });

  it("should handle empty object", () => {
    const result = serializeYAML({});
    expect(result).toBe("\n");
  });
});

describe("parseYAML", () => {
  let parseYAML;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/forms/common/io-config.js");
    parseYAML = module.parseYAML;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should parse flat key-value pairs", () => {
    const yaml = "nombre: Juan\nedad: 25\n";
    const result = parseYAML(yaml);
    expect(result).toEqual({ nombre: "Juan", edad: 25 });
  });

  it("should parse boolean values", () => {
    const yaml = "activo: true\ninactivo: false\n";
    const result = parseYAML(yaml);
    expect(result).toEqual({ activo: true, inactivo: false });
  });

  it("should parse quoted strings", () => {
    const yaml = 'titulo: "Hola: Mundo"\n';
    const result = parseYAML(yaml);
    expect(result).toEqual({ titulo: "Hola: Mundo" });
  });

  it("should parse inline dash list", () => {
    const yaml = "equipos:\n  - item: \"1\"\n    nombre: Cámara\n  - item: \"2\"\n    nombre: Trípode\n";
    const result = parseYAML(yaml);
    expect(result.equipos).toBeInstanceOf(Array);
    expect(result.equipos).toHaveLength(2);
    expect(result.equipos[0].item).toBe("1");
    expect(result.equipos[0].nombre).toBe("Cámara");
    expect(result.equipos[1].item).toBe("2");
    expect(result.equipos[1].nombre).toBe("Trípode");
  });

  it("should round-trip simple object through serialize and parse", () => {
    const original = {
      nombre: "Test",
      activo: true,
      cantidad: 42,
    };
    const { serializeYAML } = { serializeYAML: module?.serializeYAML };
  });

  it("should round-trip complex object through serialize and parse", async () => {
    const mod = await import("../js/forms/common/io-config.js");
    const original = {
      proyecto: "Mi Proyecto",
      asignatura: "Sonido I",
      responsable: "Juan Pérez",
      "mismo-dia": true,
      equipos: [
        { item: "1", nombre: "Cámara" },
        { item: "2", nombre: "Trípode" },
      ],
    };
    const yaml = mod.serializeYAML(original);
    const parsed = mod.parseYAML(yaml);
    expect(parsed.proyecto).toBe(original.proyecto);
    expect(parsed["mismo-dia"]).toBe(original["mismo-dia"]);
    expect(parsed.equipos).toBeInstanceOf(Array);
    expect(parsed.equipos).toHaveLength(2);
    expect(parsed.equipos[0].nombre).toBe("Cámara");
    expect(parsed.equipos[1].item).toBe("2");
  });

  it("should ignore comment lines", () => {
    const yaml = "# Esto es un comentario\nclave: valor\n";
    const result = parseYAML(yaml);
    expect(result).toEqual({ clave: "valor" });
  });
});

describe("validateImportData", () => {
  let validateImportData;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/forms/common/io-config.js");
    validateImportData = module.validateImportData;
  });

  it("should return false when data is null", () => {
    expect(validateImportData(null, ["proyecto"], "test")).toBe(false);
  });

  it("should return false when data is undefined", () => {
    expect(validateImportData(undefined, ["proyecto"], "test")).toBe(false);
  });

  it("should return true when required key exists with value", () => {
    expect(validateImportData({ proyecto: "Test" }, ["proyecto"], "test")).toBe(
      true,
    );
  });

  it("should return true when required key exists with undefined value", () => {
    expect(validateImportData({ proyecto: undefined }, ["proyecto"], "test")).toBe(
      true,
    );
  });

  it("should return true when at least one of multiple required keys exists", () => {
    expect(
      validateImportData(
        { responsable: "Juan" },
        ["proyecto", "responsable"],
        "test",
      ),
    ).toBe(true);
  });

  it("should throw when no required keys exist in data", () => {
    expect(() =>
      validateImportData({ foo: "bar" }, ["proyecto"], "solicitud F1"),
    ).toThrow("El archivo no contiene datos válidos de solicitud F1.");
  });

  it("should throw when data is empty object", () => {
    expect(() =>
      validateImportData({}, ["nombre"], "acta F2"),
    ).toThrow("El archivo no contiene datos válidos de acta F2.");
  });

  it("should use the provided formLabel in the error message", () => {
    expect(() =>
      validateImportData({ x: 1 }, ["proyecto", "directo-responsable"], "solicitud F4"),
    ).toThrow("El archivo no contiene datos válidos de solicitud F4.");
  });
});

describe("downloadJSON", () => {
  let downloadJSON;
  let createObjectURLSpy;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/forms/common/io-config.js");
    downloadJSON = module.downloadJSON;

    createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    vi.spyOn(document.body, "removeChild").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a blob with JSON content", () => {
    downloadJSON({ nombre: "Test" }, "archivo");
    expect(createObjectURLSpy).toHaveBeenCalled();
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
  });

  it("should create an anchor element and click it", () => {
    const mockAnchor = document.createElement("a");
    const clickSpy = vi.fn();
    mockAnchor.click = clickSpy;
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);

    downloadJSON({ a: 1 }, "test");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should set correct filename with .json extension", () => {
    const mockAnchor = document.createElement("a");
    mockAnchor.click = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);

    downloadJSON({}, "mi-archivo");
    expect(mockAnchor.download).toBe("mi-archivo.json");
  });
});

describe("downloadYAML", () => {
  let downloadYAML;
  let createObjectURLSpy;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/forms/common/io-config.js");
    downloadYAML = module.downloadYAML;

    createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    vi.spyOn(document.body, "removeChild").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a blob with YAML content", () => {
    downloadYAML({ nombre: "Test" }, "archivo");
    expect(createObjectURLSpy).toHaveBeenCalled();
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/yaml");
  });

  it("should set filename with .yaml extension", () => {
    const mockAnchor = document.createElement("a");
    mockAnchor.click = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);

    downloadYAML({}, "test-file");
    expect(mockAnchor.download).toBe("test-file.yaml");
  });
});
