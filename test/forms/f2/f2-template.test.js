import { describe, it, expect } from "vitest";
import { buildF2Template } from "../../../js/forms/f2/f2-template.js";

describe("buildF2Template", () => {
  const baseData = {
    nombre: "Juan Pérez",
    "tipo-documento": "CC",
    "numero-documento": "123456789",
    contacto: "3001234567",
    "periodo-inicial": "2026-01-01",
    "periodo-final": "2026-02-01",
    "fecha-constancia": "2026-01-15",
  };

  it("returns a string containing HTML", () => {
    const result = buildF2Template(baseData);
    expect(typeof result).toBe("string");
    expect(result).toContain("<style>");
    expect(result).toContain("ACTA DE COMPROMISO");
  });

  it("includes form field values in the output", () => {
    const result = buildF2Template(baseData);
    expect(result).toContain("Juan Pérez");
    expect(result).toContain("123456789");
    expect(result).toContain("3001234567");
    expect(result).toContain("Cédula de Ciudadanía");
  });

  it("formats dates with Spanish month names", () => {
    const result = buildF2Template(baseData);
    expect(result).toContain("1 de enero de 2026");
    expect(result).toContain("1 de febrero de 2026");
    expect(result).toContain("15 de enero de 2026");
  });

  it("shows blank signature field when no name", () => {
    const result = buildF2Template(baseData);
    expect(result).toContain('class="signature-field"');
  });

  it("shows name in signature field when firma-nombre is true", () => {
    const result = buildF2Template({ ...baseData, "firma-nombre": true });
    expect(result).toContain("Juan Pérez");
    const nameCount = result.split("Juan Pérez").length;
    expect(nameCount).toBeGreaterThanOrEqual(2);
  });

  it("handles non-CC document types", () => {
    const resultCE = buildF2Template({ ...baseData, "tipo-documento": "CE" });
    expect(resultCE).toContain("Cédula de Extranjería");

    const resultTI = buildF2Template({ ...baseData, "tipo-documento": "TI" });
    expect(resultTI).toContain("Tarjeta de Identidad");

    const resultPA = buildF2Template({ ...baseData, "tipo-documento": "PA" });
    expect(resultPA).toContain("Pasaporte");

    const resultNIT = buildF2Template({ ...baseData, "tipo-documento": "NIT" });
    expect(resultNIT).toContain("NIT");
  });

  it("handles missing optional fields", () => {
    const result = buildF2Template({
      nombre: "Test",
    });
    expect(result).toContain("Test");
    expect(result).not.toContain("undefined");
    expect(result).toContain("ACTA DE COMPROMISO");
  });

  it("handles empty dates gracefully", () => {
    const result = buildF2Template({
      ...baseData,
      "periodo-inicial": "",
      "periodo-final": "",
      "fecha-constancia": "",
    });
    expect(result).toContain("ACTA DE COMPROMISO");
    expect(result).toContain("____");
    expect(result).toContain("_____");
  });

  it("escapes HTML in field values", () => {
    const result = buildF2Template({
      ...baseData,
      nombre: '<script>alert("xss")</script>',
    });
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("includes university header", () => {
    const result = buildF2Template(baseData);
    expect(result).toContain("Escuela de Cine y Televisi\u00f3n");
    expect(result).toContain("assets/unal_logo.png");
  });

  it("includes signature area", () => {
    const result = buildF2Template(baseData);
    expect(result).toContain("Firma del Directo Responsable");
    expect(result).toContain("N\u00famero de contacto");
  });

  it("includes the declaration text", () => {
    const result = buildF2Template(baseData);
    expect(result).toContain("Laboratorio de Instrumentos de Producci\u00f3n Audiovisual");
  });
});
