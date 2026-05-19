import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createMockJsPDF } from "../../fixtures/mock-pdf.js";

function buildContentXml({ extraStyles = "" } = {}) {
  const styles = `
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="0.54cm"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="3.92cm"/>
    </style:style>
    <style:style style:name="co3" style:family="table-column">
      <style:table-column-properties style:column-width="2.47cm"/>
    </style:style>
    <style:style style:name="co4" style:family="table-column">
      <style:table-column-properties style:column-width="1.20cm"/>
    </style:style>
    <style:style style:name="ce12" style:family="table-cell">
      <style:table-cell-properties fo:border-left="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce11" style:family="table-cell">
      <style:table-cell-properties fo:border-right="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce30" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce31" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce16" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce25" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce33" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15.75pt"/>
    </style:style>
    <style:style style:name="ro6" style:family="table-row">
      <style:table-row-properties style:row-height="51.75pt"/>
    </style:style>${extraStyles}`;

  function dataRow(label1, data1, label2, data2) {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>${label1}</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"><text:p>${data1}</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>${label2}</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"><text:p>${data2}</text:p></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`;
  }

  function dummyRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="8" table:style-name="ce31"/>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`;
  }

  function equipRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:style-name="ce16"><text:p/></table:table-cell>
      <table:table-cell table:number-columns-spanned="5" table:style-name="ce31"><text:p/></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"><text:p/></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`;
  }

  const rows = [
    dummyRow(), // 0
    dummyRow(), // 1
    dummyRow(), // 2
    dummyRow(), // 3
    dummyRow(), // 4
    dummyRow(), // 5
    dataRow("NOMBRE DEL PROYECTO:", "", "ASIGNATURA:", ""), // 6
    dataRow("DIRECTO RESPONSABLE:", "", "TIUN:", ""), // 7
    dataRow("LUGAR DE GRABACI\u00d3N:", "", "CELULAR:", ""), // 8
    dataRow("PRESTAMO INTERNO", "", "PRESTAMO EXTERNO", ""), // 9
    dummyRow(), // 10
    dataRow("FECHA DE RETIRO:", "", "FECHA DE ENTREGA:", ""), // 11
    dataRow("HORA DE RETIRO:", "", "HORA DE ENTREGA:", ""), // 12
    dummyRow(), // 13
    dummyRow(), // 14
    `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:style-name="ce30"><text:p>ITEM</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="5" table:style-name="ce30"><text:p>EQUIPO</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>CONSECUTIVO VIGENTE</text:p></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`, // 15
  ];

  for (let i = 0; i < 14; i++) rows.push(equipRow()); // 16-29

  rows.push(
    `<table:table-row table:style-name="ro6">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>OBSERVACIONES:</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="6" table:style-name="ce31"/>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`, // 30
    dataRow("DOCENTE QUE AUTORIZA:", "", "FIRMA DEL DOCENTE:", ""), // 31
    dummyRow(), // 32
    dummyRow(), // 33
    dummyRow(), // 34 - signature border area
    `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="3" table:style-name="ce30"><text:p>FIRMA COORDINADOR</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="3" table:style-name="ce30"><text:p>FIRMA DIRECTO RESPONSABLE</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>Vo. Bo.</text:p></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`, // 35 - signature labels
    `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="3" table:style-name="ce31"/>
      <table:table-cell table:style-name="ce25"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"/>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`, // 36 - NOMBRE
    `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:style-name="ce25"><text:p>C.C.:</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"/>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`, // 37 - C.C.
    dummyRow(), // 37
    dummyRow(), // 38
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  office:version="1.3">
  <office:automatic-styles>${styles}</office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-column table:style-name="co2"/>
        <table:table-column table:style-name="co3" table:number-columns-repeated="7"/>
        <table:table-column table:style-name="co4"/>
        ${rows.join("\n")}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}

describe("F1 PDF Generation", () => {
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
        <form id="f1-form" onsubmit="return false;">
          <div class="form-card">
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="proyecto" required placeholder="Nombre del proyecto" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="asignatura" list="asignaturas-sugeridas" required placeholder="Ej: Producci\u00f3n de Televisi\u00f3n" />
                <datalist id="asignaturas-sugeridas"></datalist>
              </div>
              <div class="form-group">
                <input type="text" id="docente" required placeholder="Nombre del docente" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="responsable" required placeholder="Nombre completo" />
              </div>
              <div class="form-group">
                <input type="tel" id="celular" required placeholder="N\u00famero de celular" />
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group">
                <input type="text" id="tiun" required placeholder="TIUN" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="lugar" required placeholder="Ej: Estudio de TV" />
              </div>
              <div class="form-group">
                <select id="tipo-prestamo" required>
                  <option value="">Seleccionar...</option>
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="datetime-local" id="fecha-retiro" required />
              </div>
              <div class="form-group">
                <input type="datetime-local" id="fecha-entrega" required />
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group checkbox-group">
                <input type="checkbox" id="mismo-dia" />
                <label for="mismo-dia">Se entrega el mismo d\u00eda</label>
              </div>
            </div>
          </div>
          <div class="form-card">
            <table class="equip-table">
              <thead><tr><th>Item</th><th>Equipo</th><th>Consecutivo</th><th></th></tr></thead>
              <tbody id="equip-tbody">
                <tr class="equip-row">
                  <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" /></td>
                  <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required /></td>
                  <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required /></td>
                  <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">\u2715</button></td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="btn-add-equip" id="add-equip-btn">+ Agregar equipo</button>
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
                <button type="button" class="dropdown-item" id="btn-ods">ODS</button>
                <button type="button" class="dropdown-item" id="btn-xlsx">XLSX</button>
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

    await import("../../../js/forms/f1/f1-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Sonido I";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("responsable").value = "Responsable Test";
    document.getElementById("celular").value = "1234567890";
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("tipo-prestamo").value = "Interno";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
    document.querySelector('input[name="equipo-nombre"]').value = "C\u00e1mara";
    document.querySelector('input[name="equipo-consecutivo"]').value = "CON-001";
  }

  function mockOdsTemplate({ contentXml, includeImage } = {}) {
    const xml = contentXml || buildContentXml();
    const encoder = new TextEncoder();
    const buffer = encoder.encode(xml).buffer;

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(buffer),
    });

    const zipFiles = {
      "content.xml": { async: () => Promise.resolve(xml) },
    };
    if (includeImage) {
      zipFiles["media/image1.jpg"] = {
        async: () => Promise.resolve("fakebase64"),
      };
    }

    window.JSZip = {
      loadAsync: vi.fn().mockResolvedValue({
        file: vi.fn((name) => zipFiles[name] || null),
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
        expect(doc.save).toHaveBeenCalledWith("f1_proyecto_test_responsable_test_2026-01-01.pdf");
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
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("observaciones").value = "Nota importante";
      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Proyecto Test");
        expect(allText).toContain("Sonido I");
        expect(allText).toContain("Nota importante");
        expect(allText).toContain("Responsable Test");
        expect(allText).toContain("TIUN123");
      });
    });

    it("should render equipment data via template", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.querySelector('input[name="equipo-item"]').value = "1";
      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("C\u00e1mara");
        expect(allText).toContain("CON-001");
      });
    });

    it("should render equipment with provided data", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.querySelector('input[name="equipo-item"]').value = "1";

      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        const errors = window.EcytvUI.showSnackbar.mock.calls
          .map((c) => c[0])
          .filter((m) => m.toLowerCase().includes("error"));
        if (errors.length > 0) {
          throw new Error("PDF generation error: " + errors.join(", "));
        }
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });
  });

  describe("PDF branch coverage", () => {
    it("should handle external loan type", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("tipo-prestamo").value = "Externo";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("PRESTAMO EXTERNO");
      });
    });

    it("should handle missing observaciones", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("observaciones").value = "";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should handle multiple equipment rows without overflow", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("add-equip-btn").click();
      const rows = document.querySelectorAll(".equip-row");
      rows[1].querySelector('input[name="equipo-nombre"]').value = "Micr\u00f3fono";
      rows[1].querySelector('input[name="equipo-consecutivo"]').value = "MIC-001";
      rows[0].querySelector('input[name="equipo-item"]').value = "1";
      rows[1].querySelector('input[name="equipo-item"]').value = "2";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Micr\u00f3fono");
        expect(allText).toContain("MIC-001");
      });
    });

    it("should handle equipment overflow with extra pages", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();

      for (let i = 0; i < 15; i++) {
        if (i > 0) {
          document.getElementById("add-equip-btn").click();
        }
        const equipRows = document.querySelectorAll(".equip-row");
        const eq = equipRows[i];
        if (eq) {
          eq.querySelector('input[name="equipo-nombre"]').value = "Equipo " + (i + 1);
          eq.querySelector('input[name="equipo-consecutivo"]').value =
            "CON-" + String(i + 1).padStart(3, "0");
          eq.querySelector('input[name="equipo-item"]').value = String(i + 1);
        }
      }

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(doc.addPage).toHaveBeenCalled();
      });
    });

    it("should handle vertical-align bottom style", async () => {
      const contentXml = buildContentXml({
        extraStyles: `
    <style:style style:name="ce-vbottom" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="bottom"/>
    </style:style>`,
      }).replace(
        'table:style-name="ce30"><text:p>NOMBRE DEL PROYECTO:</text:p>',
        'table:style-name="ce-vbottom"><text:p>NOMBRE DEL PROYECTO:</text:p>',
      );
      const doc = createMockJsPDF();
      mockOdsTemplate({ contentXml });
      fillAllRequired();

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should handle image in ODS template", async () => {
      const imageRow = `<table:table-row table:style-name="ro1">
      <table:table-cell>
        <draw:frame draw:style-name="fr1" draw:layer="layout">
          <draw:image xlink:href="media/image1.jpg"/>
        </draw:frame>
      </table:table-cell>
    </table:table-row>`;
      const contentXml = buildContentXml().replace("</table:table>", imageRow + "</table:table>");
      const doc = createMockJsPDF();
      mockOdsTemplate({ contentXml, includeImage: true });
      fillAllRequired();

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(doc.addImage).toHaveBeenCalled();
      });
    });

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
      document.getElementById("observaciones").value =
        "Observación muy larga que debe dividirse en varias líneas por el ancho de la celda";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should handle text wrapping with long unbroken word", async () => {
      const doc = createMockJsPDF();
      doc.getTextWidth = vi.fn(() => 200);
      const contentXml = buildContentXml({
        extraStyles: `
    <style:style style:name="ce-vcenter" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="top"/>
      <style:paragraph-properties fo:text-align="center"/>
    </style:style>`,
      }).replace(
        'table:style-name="ce30"><text:p>NOMBRE DEL PROYECTO:</text:p>',
        'table:style-name="ce-vcenter"><text:p>NOMBRE DEL PROYECTO:</text:p>',
      );
      mockOdsTemplate({ contentXml });
      fillAllRequired();

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should render background color for cells", async () => {
      const contentXml = buildContentXml({
        extraStyles: `
    <style:style style:name="ce-bg" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" fo:background-color="#ffcccc"/>
    </style:style>`,
      }).replace(
        'table:style-name="ce30"><text:p>NOMBRE DEL PROYECTO:</text:p>',
        'table:style-name="ce-bg"><text:p>NOMBRE DEL PROYECTO:</text:p>',
      );
      const doc = createMockJsPDF();
      mockOdsTemplate({ contentXml });
      fillAllRequired();

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(doc.setFillColor).toHaveBeenCalledWith("#ffcccc");
      });
    });

    it("should render right-aligned text", async () => {
      const contentXml = buildContentXml({
        extraStyles: `
    <style:style style:name="ce-right" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
      <style:paragraph-properties fo:text-align="end"/>
    </style:style>`,
      }).replace(
        'table:style-name="ce30"><text:p>NOMBRE DEL PROYECTO:</text:p>',
        'table:style-name="ce-right"><text:p>NOMBRE DEL PROYECTO:</text:p>',
      );
      const doc = createMockJsPDF();
      mockOdsTemplate({ contentXml });
      fillAllRequired();

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });
  });
});
