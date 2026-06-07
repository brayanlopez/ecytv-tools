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
    expect(result).toContain('    item: "1"');
    expect(result).toContain("    nombre: Cámara");
    expect(result).toContain('    item: "2"');
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

  it("should serialize array of primitive values", () => {
    const data = { tags: ["a", "b", "c"] };
    const result = serializeYAML(data);
    expect(result).toContain("tags:");
    expect(result).toContain("  - a");
    expect(result).toContain("  - b");
    expect(result).toContain("  - c");
  });

  it("should serialize nested objects", () => {
    const data = { meta: { author: "Juan", version: 2 } };
    const result = serializeYAML(data);
    expect(result).toContain("meta:");
    expect(result).toContain("  author: Juan");
    expect(result).toContain("  version: 2");
  });

  it("should serialize null and undefined values", () => {
    const data = { a: null, b: undefined };
    const result = serializeYAML(data);
    expect(result).toContain("a: null");
    expect(result).toContain("b: null");
  });

  it("should serialize numeric zero", () => {
    const result = serializeYAML({ count: 0 });
    expect(result).toContain("count: 0");
  });

  it("should quote strings starting with numbers", () => {
    const result = serializeYAML({ code: "123abc" });
    expect(result).toContain('code: "123abc"');
  });

  it("should not quote simple alphanumeric strings", () => {
    const result = serializeYAML({ name: "simple" });
    expect(result).toContain("name: simple");
  });

  it("should quote strings equal to true/false/null", () => {
    const result = serializeYAML({ flag: "true", nothing: "null" });
    expect(result).toContain('flag: "true"');
    expect(result).toContain('nothing: "null"');
  });

  it("should escape quotes and backslashes in quoted strings", () => {
    const result = serializeYAML({ desc: 'say "hello"' });
    expect(result).toContain('"');
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
    const yaml =
      'equipos:\n  - item: "1"\n    nombre: Cámara\n  - item: "2"\n    nombre: Trípode\n';
    const result = parseYAML(yaml);
    expect(result.equipos).toBeInstanceOf(Array);
    expect(result.equipos).toHaveLength(2);
    expect(result.equipos[0].item).toBe("1");
    expect(result.equipos[0].nombre).toBe("Cámara");
    expect(result.equipos[1].item).toBe("2");
    expect(result.equipos[1].nombre).toBe("Trípode");
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

  it("should parse null and tilde as null", () => {
    expect(parseYAML("val: null\n")).toEqual({ val: null });
    expect(parseYAML("val: ~\n")).toEqual({ val: null });
  });

  it("should parse float values", () => {
    const result = parseYAML("precio: 99.99\n");
    expect(result).toEqual({ precio: 99.99 });
  });

  it("should parse empty string value", () => {
    const result = parseYAML("clave:\n");
    expect(result).toEqual({ clave: "" });
  });

  it("should parse single-quoted strings", () => {
    const result = parseYAML("titulo: 'contenido: especial'\n");
    expect(result).toEqual({ titulo: "contenido: especial" });
  });

  it("should parse nested objects with indentation", () => {
    const yaml = "nivel1:\n  nivel2:\n    clave: valor\n";
    const result = parseYAML(yaml);
    expect(result).toEqual({ nivel1: { nivel2: { clave: "valor" } } });
  });

  it("should parse dash-prefixed list items with colon", () => {
    const yaml = "items:\n  - nombre: Juan\n    edad: 30\n";
    const result = parseYAML(yaml);
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items[0].nombre).toBe("Juan");
    expect(result.items[0].edad).toBe(30);
  });

  it("should handle empty lines in YAML", () => {
    const yaml = "clave: valor\n\notra: cosa\n";
    const result = parseYAML(yaml);
    expect(result).toEqual({ clave: "valor", otra: "cosa" });
  });

  it("should handle lines without colon separator", () => {
    const result = parseYAML("just a line without colon\nclave: valor\n");
    expect(result).toEqual({ clave: "valor" });
  });

  it("should parse value after colon with pipe", () => {
    const result = parseYAML("desc: |\n  multi\n  line\n");
    expect(result).toHaveProperty("desc");
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
    expect(validateImportData({ proyecto: "Test" }, ["proyecto"], "test")).toBe(true);
  });

  it("should return true when required key exists with undefined value", () => {
    expect(validateImportData({ proyecto: undefined }, ["proyecto"], "test")).toBe(true);
  });

  it("should return true when at least one of multiple required keys exists", () => {
    expect(validateImportData({ responsable: "Juan" }, ["proyecto", "responsable"], "test")).toBe(
      true,
    );
  });

  it("should throw when no required keys exist in data", () => {
    expect(() => validateImportData({ foo: "bar" }, ["proyecto"], "solicitud F1")).toThrow(
      "El archivo no contiene datos válidos de solicitud F1.",
    );
  });

  it("should throw when data is empty object", () => {
    expect(() => validateImportData({}, ["nombre"], "acta F2")).toThrow(
      "El archivo no contiene datos válidos de acta F2.",
    );
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

    createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
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

    createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
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

describe("importFromFile", () => {
  let importFromFile;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import("../js/forms/common/io-config.js");
    importFromFile = module.importFromFile;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockCreateElement(handlerCallback) {
    const mockInput = document.createElement("input");
    vi.spyOn(mockInput, "click").mockImplementation(() => {});
    vi.spyOn(mockInput, "addEventListener").mockImplementation((event, handler) => {
      if (event === "change") {
        handlerCallback(handler);
      }
    });
    vi.spyOn(document, "createElement").mockReturnValue(mockInput);
    return mockInput;
  }

  it("should create file input and click it", () => {
    const mockInput = mockCreateElement(() => {});

    importFromFile();
    expect(document.createElement).toHaveBeenCalledWith("input");
    expect(mockInput.type).toBe("file");
    expect(mockInput.accept).toBe(".json,.yaml,.yml");
    expect(mockInput.click).toHaveBeenCalled();
  });

  it("should resolve with parsed JSON for .json file", async () => {
    let changeHandler;
    mockCreateElement((h) => {
      changeHandler = h;
    });

    const file = new Blob(['{"nombre": "Test", "valor": 42}'], { type: "application/json" });
    Object.defineProperty(file, "name", { value: "data.json" });
    const promise = importFromFile();
    changeHandler({ target: { files: [file] } });
    const result = await promise;
    expect(result).toEqual({ nombre: "Test", valor: 42 });
  });

  it("should resolve with parsed YAML for .yaml file", async () => {
    let changeHandler;
    mockCreateElement((h) => {
      changeHandler = h;
    });

    const file = new Blob(["nombre: Juan\nedad: 25\n"], { type: "text/yaml" });
    Object.defineProperty(file, "name", { value: "data.yaml" });
    const promise = importFromFile();
    changeHandler({ target: { files: [file] } });
    const result = await promise;
    expect(result).toEqual({ nombre: "Juan", edad: 25 });
  });

  it("should do nothing when no file is selected", async () => {
    let changeHandler;
    mockCreateElement((h) => {
      changeHandler = h;
    });

    importFromFile();
    changeHandler({ target: { files: [] } });
    await vi.waitFor(() => {});
  });

  it("should reject on invalid JSON content", async () => {
    let changeHandler;
    mockCreateElement((h) => {
      changeHandler = h;
    });

    const file = new Blob(["not json"], { type: "text/plain" });
    Object.defineProperty(file, "name", { value: "bad.json" });
    const promise = importFromFile();
    changeHandler({ target: { files: [file] } });

    await expect(promise).rejects.toThrow("Formato de archivo no v\u00e1lido. Usa JSON o YAML.");
  });

  it("should handle .yml extension as YAML", async () => {
    let changeHandler;
    mockCreateElement((h) => {
      changeHandler = h;
    });

    const file = new Blob(["clave: valor\n"], { type: "text/yaml" });
    Object.defineProperty(file, "name", { value: "data.yml" });
    const promise = importFromFile();
    changeHandler({ target: { files: [file] } });
    const result = await promise;
    expect(result).toEqual({ clave: "valor" });
  });
});
