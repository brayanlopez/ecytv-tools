import { describe, it, expect } from "vitest";
import { buildF3Template } from "../../../js/forms/f3/f3-template.js";

function parseHtml(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

describe("buildF3Template", () => {
  const baseData = {
    proyecto: "Proyecto de Prueba",
    asignatura: "Dirección de Arte",
    docente: "Docente de Prueba",
    autorizado: "Autorizado de Prueba",
    "tipo-documento": "CC",
    "numero-documento": "123456789",
    tiun: "TIUN123",
    celular: "3000000000",
    lugar: "Estudio de grabación",
    "fecha-retiro": "2026-01-01T08:00",
    "fecha-entrega": "2026-01-01T17:00",
    observaciones: "Nota de prueba",
    equipos: [
      { item: "1", tipo: "Iluminación", cantidad: "2", codigo: "COD-001", elemento: "Reflector" },
      { item: "2", tipo: "Sonido", cantidad: "1", codigo: "COD-002", elemento: "Micrófono" },
    ],
  };

  it("returns a string containing HTML", () => {
    const result = buildF3Template(baseData);
    expect(typeof result).toBe("string");
    expect(result).toContain("<style>");
    expect(result).toContain("SOLICITUD DE RESERVA");
    expect(result).toContain("BODEGA DE ARTE");
  });

  it("includes form field values in the output", () => {
    const result = buildF3Template(baseData);
    expect(result).toContain("Proyecto de Prueba");
    expect(result).toContain("Dirección de Arte");
    expect(result).toContain("Docente de Prueba");
    expect(result).toContain("Autorizado de Prueba");
    expect(result).toContain("TIUN123");
    expect(result).toContain("3000000000");
    expect(result).toContain("Estudio de grabación");
    expect(result).toContain("Nota de prueba");
  });

  it("formats date and time from datetime-local value", () => {
    const result = buildF3Template(baseData);
    expect(result).toContain("2026-01-01");
    expect(result).toContain("08:00");
    expect(result).toContain("17:00");
  });

  it("renders equipment rows", () => {
    const result = buildF3Template(baseData);
    expect(result).toContain("Reflector");
    expect(result).toContain("COD-001");
    expect(result).toContain("Micrófono");
    expect(result).toContain("COD-002");
  });

  it("fills empty slots up to 14 equipment rows", () => {
    const data = {
      ...baseData,
      equipos: [{ item: "1", tipo: "Test", cantidad: "1", codigo: "C001", elemento: "Solo uno" }],
    };
    const result = buildF3Template(data);
    const doc = parseHtml(result);
    const equipRows = doc.querySelectorAll(".equipment-table td");
    const filledRows = Array.from(equipRows).filter((r) => r.textContent.trim());
    expect(filledRows.length).toBeGreaterThan(0);
    expect(result).not.toContain("undefined");
  });

  it("handles empty equipos array", () => {
    const result = buildF3Template({ ...baseData, equipos: [] });
    expect(result).toContain("SOLICITUD DE RESERVA");
  });

  it("handles missing optional fields", () => {
    const result = buildF3Template({
      proyecto: "Test",
      autorizado: "Test",
    });
    expect(result).toContain("Test");
    expect(result).not.toContain("undefined");
  });

  it("escapes HTML in field values", () => {
    const result = buildF3Template({
      ...baseData,
      proyecto: '<script>alert("xss")</script>',
    });
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("includes university header", () => {
    const result = buildF3Template(baseData);
    expect(result).toContain("Escuela de Cine y Televisi\u00f3n");
    expect(result).toContain("assets/unal_logo.png");
  });

  it("includes signature area with autorizado name and document", () => {
    const result = buildF3Template(baseData);
    expect(result).toContain("Autorizado de Prueba");
    expect(result).toContain("123456789");
    expect(result).toContain("FIRMA DEL ESTUDIANTE AUTORIZADO");
    expect(result).toContain("FIRMA DEL MONITOR RESPONSABLE");
  });

  it("only renders up to 14 equipment rows", () => {
    const manyEquipos = Array.from({ length: 20 }, (_, i) => ({
      item: String(i + 1),
      tipo: "Tipo",
      cantidad: "1",
      codigo: `COD-${i}`,
      elemento: `Elemento ${i + 1}`,
    }));
    const result = buildF3Template({ ...baseData, equipos: manyEquipos });
    const doc = parseHtml(result);
    const rows = doc.querySelectorAll(".equipment-table .type-col");
    const filledRows = Array.from(rows).filter(
      (r) => r.textContent.trim() && r.textContent.trim() !== "TIPO",
    );
    expect(filledRows.length).toBe(14);
  });
});
