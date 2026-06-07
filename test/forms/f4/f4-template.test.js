import { describe, it, expect } from "vitest";
import { buildF4Template } from "../../../js/forms/f4/f4-template.js";

function parseHtml(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

describe("buildF4Template", () => {
  const baseData = {
    proyecto: "Proyecto de Prueba",
    asignatura: "Edición Digital",
    docente: "Docente de Prueba",
    "directo-responsable": "Responsable de Prueba",
    "tipo-documento": "CC",
    "numero-documento": "123456789",
    tiun: "TIUN123",
    observaciones: "Nota de prueba",
    salas: [
      { nombre: "Sala NL1", fecha: "2026-06-01", "hora-inicio": "08:00", "hora-fin": "10:00" },
      { nombre: "Sala NL2", fecha: "2026-06-02", "hora-inicio": "14:00", "hora-fin": "16:00" },
    ],
  };

  it("returns a string containing HTML", () => {
    const result = buildF4Template(baseData);
    expect(typeof result).toBe("string");
    expect(result).toContain("<style>");
    expect(result).toContain("SOLICITUD DE RESERVA");
    expect(result).toContain("SALAS DE EDICI\u00d3N");
  });

  it("includes form field values in the output", () => {
    const result = buildF4Template(baseData);
    expect(result).toContain("Proyecto de Prueba");
    expect(result).toContain("Edición Digital");
    expect(result).toContain("Docente de Prueba");
    expect(result).toContain("Responsable de Prueba");
    expect(result).toContain("TIUN123");
    expect(result).toContain("Nota de prueba");
  });

  it("renders sala rows", () => {
    const result = buildF4Template(baseData);
    expect(result).toContain("Sala NL1");
    expect(result).toContain("2026-06-01");
    expect(result).toContain("08:00");
    expect(result).toContain("10:00");
    expect(result).toContain("Sala NL2");
    expect(result).toContain("2026-06-02");
    expect(result).toContain("14:00");
    expect(result).toContain("16:00");
  });

  it("fills empty slots up to 4 sala rows", () => {
    const data = {
      ...baseData,
      salas: [
        { nombre: "Sala NL1", fecha: "2026-06-01", "hora-inicio": "08:00", "hora-fin": "10:00" },
      ],
    };
    const result = buildF4Template(data);
    const doc = parseHtml(result);
    const salaRows = doc.querySelectorAll(".sala-table .sala-name-col");
    const filledRows = Array.from(salaRows).filter(
      (r) => r.textContent.trim() && r.textContent.trim() !== "SALA ADJUDICADA",
    );
    expect(filledRows.length).toBe(1);
  });

  it("handles empty salas array", () => {
    const result = buildF4Template({ ...baseData, salas: [] });
    expect(result).toContain("SOLICITUD DE RESERVA");
  });

  it("handles missing optional fields", () => {
    const result = buildF4Template({
      proyecto: "Test",
      "directo-responsable": "Test",
    });
    expect(result).toContain("Test");
    expect(result).not.toContain("undefined");
  });

  it("escapes HTML in field values", () => {
    const result = buildF4Template({
      ...baseData,
      proyecto: '<script>alert("xss")</script>',
    });
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("includes university header", () => {
    const result = buildF4Template(baseData);
    expect(result).toContain("Escuela de Cine y Televisi\u00f3n");
    expect(result).toContain("assets/unal_logo.png");
  });

  it("includes signature area with responsible info", () => {
    const result = buildF4Template(baseData);
    expect(result).toContain("Responsable de Prueba");
    expect(result).toContain("123456789");
    expect(result).toContain("FIRMA DEL DIRECTO RESPONSABLE");
    expect(result).toContain("FIRMA DEL LABORATORIO");
  });

  it("only renders up to 4 sala rows", () => {
    const manySalas = Array.from({ length: 10 }, (_, i) => ({
      nombre: `Sala ${i + 1}`,
      fecha: "2026-06-01",
      "hora-inicio": "08:00",
      "hora-fin": "10:00",
    }));
    const result = buildF4Template({ ...baseData, salas: manySalas });
    const doc = parseHtml(result);
    const rows = doc.querySelectorAll(".sala-table .sala-name-col");
    const filledRows = Array.from(rows).filter(
      (r) => r.textContent.trim() && r.textContent.trim() !== "SALA ADJUDICADA",
    );
    expect(filledRows.length).toBe(4);
  });
});
