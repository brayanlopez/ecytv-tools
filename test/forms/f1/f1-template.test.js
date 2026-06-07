import { describe, it, expect } from "vitest";
import { buildF1Template } from "../../../js/forms/f1/f1-template.js";

function parseHtml(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

describe("buildF1Template", () => {
  const baseData = {
    proyecto: "Proyecto de Prueba",
    asignatura: "Producción Audiovisual",
    docente: "Docente de Prueba",
    responsable: "Estudiante de Prueba",
    celular: "3000000000",
    tiun: "1234567890",
    lugar: "Estudio de grabación",
    "tipo-prestamo": "Interno",
    "fecha-retiro": "2025-06-01T08:00",
    "fecha-entrega": "2025-06-01T17:00",
    observaciones: "Nota de prueba",
    equipos: [
      { item: "1", nombre: "Equipo de cámara 01", consecutivo: "CON-001" },
      { item: "2", nombre: "Kit de iluminación 03", consecutivo: "CON-002" },
    ],
  };

  it("returns a string containing HTML", () => {
    const result = buildF1Template(baseData);
    expect(typeof result).toBe("string");
    expect(result).toContain("<style>");
    expect(result).toContain("SOLICITUD DE RESERVA");
  });

  it("includes form field values in the output", () => {
    const result = buildF1Template(baseData);
    expect(result).toContain("Proyecto de Prueba");
    expect(result).toContain("Producción Audiovisual");
    expect(result).toContain("Docente de Prueba");
    expect(result).toContain("Estudiante de Prueba");
    expect(result).toContain("3000000000");
    expect(result).toContain("1234567890");
    expect(result).toContain("Estudio de grabación");
    expect(result).toContain("Nota de prueba");
  });

  function normalize(html) {
    return html.replace(/>\s+</g, "><").replace(/\s+/g, " ");
  }

  it("renders X for Interno loan type", () => {
    const result = normalize(buildF1Template({ ...baseData, "tipo-prestamo": "Interno" }));
    expect(result).toContain(">PRESTAMO INTERNO<");
    expect(result).toContain('PRESTAMO INTERNO</td><td class="value">X<');
    expect(result).toContain('PRESTAMO EXTERNO</td><td class="value"><');
  });

  it("renders X for Externo loan type", () => {
    const result = normalize(buildF1Template({ ...baseData, "tipo-prestamo": "Externo" }));
    expect(result).toContain('PRESTAMO INTERNO</td><td class="value"><');
    expect(result).toContain('PRESTAMO EXTERNO</td><td class="value">X<');
  });

  it("formats date and time from datetime-local value", () => {
    const result = buildF1Template(baseData);
    expect(result).toContain("2025-06-01");
    expect(result).toContain("08:00");
    expect(result).toContain("17:00");
  });

  it("renders equipment rows", () => {
    const result = buildF1Template(baseData);
    expect(result).toContain("Equipo de cámara 01");
    expect(result).toContain("CON-001");
    expect(result).toContain("Kit de iluminación 03");
    expect(result).toContain("CON-002");
  });

  it("fills empty slots up to 14 equipment rows", () => {
    const data = {
      ...baseData,
      equipos: [{ item: "1", nombre: "Solo uno", consecutivo: "001" }],
    };
    const result = buildF1Template(data);
    const doc = parseHtml(result);
    const equipRows = doc.querySelectorAll(".equipment-table .equip-col");
    const filledRows = Array.from(equipRows).filter(
      (r) => r.textContent.trim() && r.textContent.trim() !== "EQUIPO",
    );
    expect(filledRows.length).toBe(1);
  });

  it("handles empty equipos array", () => {
    const result = buildF1Template({ ...baseData, equipos: [] });
    expect(result).toContain("SOLICITUD DE RESERVA");
  });

  it("handles missing optional fields", () => {
    const result = buildF1Template({
      proyecto: "Test",
      responsable: "Test",
    });
    expect(result).toContain("Test");
  });

  it("escapes HTML in field values", () => {
    const result = buildF1Template({
      ...baseData,
      proyecto: '<script>alert("xss")</script>',
    });
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("includes university header", () => {
    const result = buildF1Template(baseData);
    expect(result).toContain("Escuela de Cine y Televisi\u00f3n");
    expect(result).toContain("assets/unal_logo.png");
  });

  it("includes signature area with responsible name and TIUN", () => {
    const result = buildF1Template(baseData);
    expect(result).toContain("Estudiante de Prueba");
    expect(result).toContain("1234567890");
    expect(result).toContain("FIRMA COORDINADOR");
    expect(result).toContain("Vo. Bo.");
  });
});
