import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createMockJsPDF } from "../../fixtures/mock-pdf.js";

function buildF4ContentXml({ extraStyles = "" } = {}) {
  const styles = `
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="0.63cm"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="6.88cm"/>
    </style:style>
    <style:style style:name="co3" style:family="table-column">
      <style:table-column-properties style:column-width="0.61cm"/>
    </style:style>
    <style:style style:name="co4" style:family="table-column">
      <style:table-column-properties style:column-width="2.47cm"/>
    </style:style>
    <style:style style:name="co5" style:family="table-column">
      <style:table-column-properties style:column-width="2.33cm"/>
    </style:style>
    <style:style style:name="ce1" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce2" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce3" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce4" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-size="18pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce5" style:family="table-cell">
      <style:table-cell-properties style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce6" style:family="table-cell">
      <style:table-cell-properties fo:border-top="none" fo:border-bottom="none" fo:border-left="thin solid #000000" fo:border-right="none" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce7" style:family="table-cell">
      <style:table-cell-properties style:vertical-align="middle"/>
      <style:text-properties fo:font-size="70pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce8" style:family="table-cell">
      <style:table-cell-properties fo:border-top="none" fo:border-bottom="none" fo:border-left="none" fo:border-right="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce9" style:family="table-cell">
      <style:table-cell-properties style:vertical-align="middle"/>
      <style:text-properties fo:font-size="20pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="14.25pt"/>
    </style:style>
    <style:style style:name="ro2" style:family="table-row">
      <style:table-row-properties style:row-height="73.5pt"/>
    </style:style>
    <style:style style:name="ro3" style:family="table-row">
      <style:table-row-properties style:row-height="11.25pt"/>
    </style:style>
    <style:style style:name="ro4" style:family="table-row">
      <style:table-row-properties style:row-height="27pt"/>
    </style:style>
    <style:style style:name="ro5" style:family="table-row">
      <style:table-row-properties style:row-height="39.7pt"/>
    </style:style>
    <style:style style:name="ro6" style:family="table-row">
      <style:table-row-properties style:row-height="29.95pt"/>
    </style:style>
    <style:style style:name="ro7" style:family="table-row">
      <style:table-row-properties style:row-height="54.7pt"/>
    </style:style>${extraStyles}`;

  function emptyRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  function dataRow(label1, label2) {
    return `<table:table-row table:style-name="ro5">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>${label1}</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce2"><text:p>${label2}</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  function salaHeaderRow() {
    return `<table:table-row table:style-name="ro6">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>SALA ADJUDICADA</text:p></table:table-cell>
      <table:table-cell table:style-name="ce2"><text:p>FECHA</text:p></table:table-cell>
      <table:table-cell table:style-name="ce2"><text:p>HORA DE INICIO</text:p></table:table-cell>
      <table:table-cell table:style-name="ce2"><text:p>HORA DE FINALIZACIÓN</text:p></table:table-cell>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  function salaRow() {
    return `<table:table-row table:style-name="ro4">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  const salaRows = [];
  for (let i = 0; i < 4; i++) salaRows.push(salaRow());

  const footer = `
    <table:table-row table:style-name="ro7">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>OBSERVACIONES:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro7">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>DOCENTE QUE AUTORIZA:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL DOCENTE:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    ${emptyRow()}
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL DIRECTO RESPONSABLE</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL LABORATORIO</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL DIRECTO RESPONSABLE</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL LABORATORIO</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro3">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro3">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>C.C.:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    ${emptyRow()}
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  office:version="1.3">
  <office:automatic-styles>
    ${styles}
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-column table:style-name="co2"/>
        <table:table-column table:style-name="co3"/>
        <table:table-column table:style-name="co4"/>
        <table:table-column table:style-name="co5"/>
        ${emptyRow()}
        <table:table-row table:style-name="ro2">
          <table:table-cell table:style-name="ce6"/>
          <table:table-cell table:style-name="ce7"><text:p>F4</text:p></table:table-cell>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce8"/>
        </table:table-row>
        ${emptyRow()}
        <table:table-row table:style-name="ro4">
          <table:table-cell table:style-name="ce6"/>
          <table:table-cell table:style-name="ce9"><text:p>SOLICITUD DE RESERVA Y PRÉSTAMO SALAS DE EDICIÓN</text:p></table:table-cell>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce8"/>
        </table:table-row>
        <table:table-row table:style-name="ro1">
          <table:table-cell table:style-name="ce6"/>
          <table:table-cell table:style-name="ce5"><text:p>*Revisa disponibilidad antes de diligenciar.</text:p></table:table-cell>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce8"/>
        </table:table-row>
        ${emptyRow()}
        ${dataRow("NOMBRE DEL PROYECTO:", "ASIGNATURA:")}
        ${dataRow("DIRECTO RESPONSABLE:", "TIUN:")}
        ${emptyRow()}
        ${salaHeaderRow()}
        ${salaRows.join("\n")}
        ${emptyRow()}
        ${footer}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}

describe("F4 PDF Generation", () => {
  let originalFetch;

  beforeEach(async () => {
    vi.resetModules();
    originalFetch = globalThis.fetch;

    document.body.innerHTML = `
      <nav>
        <div class="container">
          <a href="#formats" class="logo" id="back-link">\u2190 Volver a Formatos</a>
        </div>
      </nav>
      <main class="form-page">
        <form id="f4-form" onsubmit="return false;">
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="proyecto" required placeholder="Nombre del proyecto" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="asignatura" list="asignaturas-sugeridas" required placeholder="Ej: Dirección de Arte" />
                <datalist id="asignaturas-sugeridas"></datalist>
              </div>
              <div class="form-group">
                <input type="text" id="docente" required placeholder="Nombre del docente" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="directo-responsable" required placeholder="Nombre completo" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <select id="tipo-documento" required>
                  <option value="">Seleccionar...</option>
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              <div class="form-group">
                <input type="text" id="numero-documento" required placeholder="Número de documento" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="tiun" required placeholder="TIUN" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <table class="equip-table">
              <thead><tr><th>Sala</th><th>Fecha</th><th>Hora inicio</th><th>Hora fin</th><th></th></tr></thead>
              <tbody id="sala-tbody">
                <tr class="sala-row">
                  <td><input type="text" name="sala-nombre" placeholder="Sala" list="salas-sugeridas" /></td>
                  <td><input type="date" name="sala-fecha" required /></td>
                  <td><input type="time" name="sala-hora-inicio" required /></td>
                  <td><input type="time" name="sala-hora-fin" required /></td>
                  <td><button type="button" class="btn-remove-equip" title="Eliminar sala">\u2715</button></td>
                </tr>
              </tbody>
            </table>
            <datalist id="salas-sugeridas"></datalist>
            <button type="button" class="btn-add-equip" id="add-sala-btn">+ Agregar sala</button>
          </div>
          <div class="form-card">
            <textarea id="observaciones" placeholder="Observaciones..."></textarea>
          </div>
          <div class="form-card" id="history-card" style="display:none">
            <h2>Historial de Solicitudes</h2>
            <div id="history-list"></div>
          </div>
          <div class="form-actions">
            <div class="btn-group">
              <button type="button" class="btn-secondary" id="btn-save">Guardar</button>
              <button type="reset" class="btn-secondary">Limpiar</button>
            </div>
            <div class="dropdown">
              <button type="button" class="btn-submit" id="btn-download">Descargar</button>
              <div class="dropdown-menu" id="download-menu">
                <button type="button" class="dropdown-item" id="btn-pdf">PDF</button>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <span class="form-actions-label">Archivo:</span>
            <div class="btn-group">
              <button type="button" class="btn-secondary" id="btn-import">Importar</button>
              <button type="button" class="btn-secondary" id="btn-export-json">JSON</button>
              <button type="button" class="btn-secondary" id="btn-export-yaml">YAML</button>
            </div>
            <p class="form-actions-hint">Guarda los datos del formulario en un archivo (JSON o YAML) para volver a cargarlos despu\u00e9s con el bot\u00f3n Importar.</p>
          </div>
        </form>
      </main>
    `;

    await import("../../../js/forms/f4/f4-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Direcci\u00f3n de Arte";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("directo-responsable").value = "Responsable Test";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("tiun").value = "TIUN123";
    document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
    document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
    document.querySelector('input[name="sala-hora-fin"]').value = "10:00";
  }

  function mockOdsTemplate({ contentXml } = {}) {
    const xml = contentXml || buildF4ContentXml();
    const encoder = new TextEncoder();
    const buffer = encoder.encode(xml).buffer;

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(buffer),
    });

    window.JSZip = {
      loadAsync: vi.fn().mockResolvedValue({
        file: vi.fn((name) =>
          name === "content.xml" ? { async: () => Promise.resolve(xml) } : null,
        ),
      }),
    };
  }

  describe("PDF Generation", () => {
    it("should generate PDF when all fields are filled", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalledOnce();
        expect(doc.save).toHaveBeenCalledWith("f4_proyecto_test_responsable_test_2026-06-01.pdf");
      });
    });

    it("should show alert when jsPDF is not loaded", () => {
      window.jspdf = undefined;
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
        "Error al cargar la librer\u00eda PDF. Verifica tu conexi\u00f3n a internet.",
        "error",
      );
    });

    it("should include form data in the PDF", async () => {
      const { generateF4PDF } = await import("../../../js/forms/f4/f4-pdf.js");
      const doc = createMockJsPDF();
      mockOdsTemplate();

      await generateF4PDF({
        proyecto: "Proyecto Test",
        asignatura: "Dirección de Arte",
        docente: "Docente Test",
        "directo-responsable": "Responsable Test",
        "tipo-documento": "CC",
        "numero-documento": "123456789",
        tiun: "TIUN123",
        observaciones: "",
        salas: [
          { nombre: "Sala NL1", fecha: "2026-06-01", "hora-inicio": "08:00", "hora-fin": "10:00" },
        ],
      });

      const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
      expect(allText).toContain("Proyecto Test");
      expect(allText).toContain("Dirección de Arte");
      expect(allText).toContain("Responsable Test");
      expect(allText).toContain("TIUN123");
    });

    it("should include dates in the PDF", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("2026-06-01");
      });
    });
  });

  describe("PDF branch coverage", () => {
    it("should handle fetch error", async () => {
      createMockJsPDF();
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });
      window.JSZip = { loadAsync: vi.fn() };
      fillAllRequired();

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          "Error al generar el archivo PDF: No se pudo cargar la plantilla ODS",
          "error",
        );
      });
    });

    it("should handle text wrapping with long content", async () => {
      const doc = createMockJsPDF();
      doc.getTextWidth = vi.fn(() => 200);
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("directo-responsable").value =
        "Nombre muy largo del responsable que debe dividirse en varias l\u00edneas por el ancho de la celda";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should generate PDF via direct generateF4PDF call", async () => {
      const { generateF4PDF } = await import("../../../js/forms/f4/f4-pdf.js");
      const doc = createMockJsPDF();
      mockOdsTemplate();

      generateF4PDF({
        proyecto: "Direct Test",
        asignatura: "Test Subject",
        docente: "Teacher",
        "directo-responsable": "Responsible Person",
        "tipo-documento": "CC",
        "numero-documento": "987654",
        tiun: "TIUN456",
        observaciones: "",
        salas: [],
      });

      await vi.waitFor(() => {
        expect(doc.save).toHaveBeenCalled();
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Direct Test");
      });
    });

    it("should handle sala rows in template", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Sala NL1");
      });
    });

    it("should handle multiple sala rows", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("add-sala-btn").click();
      const rows = document.querySelectorAll(".sala-row");
      rows[0].querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      rows[1].querySelector('input[name="sala-nombre"]').value = "Sala NL2";
      rows[1].querySelector('input[name="sala-fecha"]').value = "2026-06-02";
      rows[1].querySelector('input[name="sala-hora-inicio"]').value = "14:00";
      rows[1].querySelector('input[name="sala-hora-fin"]').value = "16:00";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Sala NL1");
        expect(allText).toContain("Sala NL2");
      });
    });

    it("should handle sala overflow with continuation page", async () => {
      const { generateF4PDF } = await import("../../../js/forms/f4/f4-pdf.js");
      const doc = createMockJsPDF();
      mockOdsTemplate();

      const salas = [];
      for (let i = 0; i < 6; i++) {
        salas.push({
          nombre: `Sala ${i + 1}`,
          fecha: "2026-06-01",
          "hora-inicio": "08:00",
          "hora-fin": "10:00",
        });
      }

      generateF4PDF({
        proyecto: "Overflow Test",
        asignatura: "Test",
        docente: "Docente",
        "directo-responsable": "Responsible",
        "tipo-documento": "CC",
        "numero-documento": "123",
        tiun: "TIUN",
        observaciones: "",
        salas,
      });

      await vi.waitFor(() => {
        expect(doc.addPage).toHaveBeenCalled();
      });
    });
  });
});
