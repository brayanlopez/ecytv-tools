import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createMockJsPDF } from "../../fixtures/mock-pdf.js";

function buildF3ContentXml({ extraStyles = "" } = {}) {
  const styles = `
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="0.58cm"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="1.40cm"/>
    </style:style>
    <style:style style:name="co3" style:family="table-column">
      <style:table-column-properties style:column-width="3.07cm"/>
    </style:style>
    <style:style style:name="co4" style:family="table-column">
      <style:table-column-properties style:column-width="2.47cm"/>
    </style:style>
    <style:style style:name="co5" style:family="table-column">
      <style:table-column-properties style:column-width="4.05cm"/>
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
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce5" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:text-properties fo:font-size="58pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15.75pt"/>
    </style:style>
    <style:style style:name="ro2" style:family="table-row">
      <style:table-row-properties style:row-height="27pt"/>
    </style:style>${extraStyles}`;

  function dataRow(label1, label2) {
    return `<table:table-row table:style-name="ro2">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>${label1}</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>${label2}</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;
  }

  function emptyRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-repeated="8" table:style-name="ce3"/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;
  }

  function equipRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;
  }

  const equipHeader = `<table:table-row table:style-name="ro2">
    <table:table-cell table:style-name="ce1"/>
    <table:table-cell table:style-name="ce2"><text:p>ITEM</text:p></table:table-cell>
    <table:table-cell table:style-name="ce2"><text:p>TIPO</text:p></table:table-cell>
    <table:table-cell table:style-name="ce2"><text:p>CANTIDAD</text:p></table:table-cell>
    <table:table-cell table:style-name="ce2"><text:p>CODIGO</text:p></table:table-cell>
    <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>ELEMENTO</text:p></table:table-cell>
    <table:covered-table-cell/>
    <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>OBSERVACIONES</text:p></table:table-cell>
    <table:covered-table-cell/>
    <table:table-cell table:style-name="ce1"/>
  </table:table-row>`;

  const equipRows = [];
  for (let i = 0; i < 14; i++) equipRows.push(equipRow());

  const footer = `
    <table:table-row table:style-name="ro2">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>DOCENTE QUE AUTORIZA:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>FIRMA DEL DOCENTE:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>
    ${emptyRow()}
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="4" table:style-name="ce2"><text:p>FIRMA DEL ESTUDIANTE AUTORIZADO</text:p></table:table-cell>
      <table:covered-table-cell table:number-columns-repeated="3"/>
      <table:table-cell table:number-columns-spanned="4" table:style-name="ce2"><text:p>FIRMA DEL MONITOR RESPONSABLE</text:p></table:table-cell>
      <table:covered-table-cell table:number-columns-repeated="3"/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>C.C.:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>C.C.:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;

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
        <table:table-column table:style-name="co4" table:number-columns-repeated="5"/>
        <table:table-column table:style-name="co5"/>
        ${emptyRow()}
        <table:table-row table:style-name="ro2">
          <table:table-cell table:style-name="ce1"/>
          <table:table-cell table:style-name="ce5"><text:p>F3</text:p></table:table-cell>
          <table:table-cell table:number-columns-repeated="7" table:style-name="ce3"/>
          <table:table-cell table:style-name="ce1"/>
        </table:table-row>
        <table:table-row table:style-name="ro2">
          <table:table-cell table:style-name="ce1"/>
          <table:table-cell table:number-columns-repeated="8" table:style-name="ce4"><text:p>SOLICITUD DE RESERVA Y PRESTAMO DE ELEMENTOS BODEGA DE ARTE</text:p></table:table-cell>
          <table:table-cell table:style-name="ce1"/>
        </table:table-row>
        ${emptyRow()}
        ${dataRow("NOMBRE DEL PROYECTO:", "ASIGNATURA:")}
        ${dataRow("AUTORIZADO:", "TIUN:")}
        ${dataRow("LUGAR DE GRABACION:", "CELULAR:")}
        ${dataRow("FECHA DE RETIRO:", "FECHA DE ENTREGA:")}
        ${dataRow("HORA DE RETIRO:", "HORA DE ENTREGA:")}
        ${emptyRow()}
        ${equipHeader}
        ${equipRows.join("\n")}
        ${footer}
        ${emptyRow()}
        ${emptyRow()}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}

describe("F3 PDF Generation", () => {
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
        <form id="f3-form" onsubmit="return false;">
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
                <input type="text" id="autorizado" required placeholder="Nombre completo" />
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
              <div class="form-group">
                <input type="tel" id="celular" required placeholder="Número de celular" />
              </div>
            </div>
          </div>
          <div class="form-card">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="lugar" required placeholder="Ej: Estudio de TV" />
              </div>
              <div class="form-group">
                <input type="datetime-local" id="fecha-retiro" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="datetime-local" id="fecha-entrega" required />
              </div>
              <div class="form-group checkbox-group">
                <input type="checkbox" id="mismo-dia" />
                <label for="mismo-dia">Se entrega el mismo día</label>
              </div>
            </div>
          </div>
          <div class="form-card">
            <table class="equip-table">
              <thead><tr><th>Item</th><th>Tipo</th><th>Cantidad</th><th>Código</th><th>Elemento</th><th></th></tr></thead>
              <tbody id="equip-tbody">
                <tr class="equip-row">
                  <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" /></td>
                  <td><input type="text" name="equipo-tipo" placeholder="Tipo" /></td>
                  <td><input type="number" name="equipo-cantidad" placeholder="Cantidad" min="1" /></td>
                  <td><input type="text" name="equipo-codigo" placeholder="Código" /></td>
                  <td><input type="text" name="equipo-elemento" placeholder="Elemento" /></td>
                  <td><button type="button" class="btn-remove-equip" title="Eliminar elemento">\u2715</button></td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="btn-add-equip" id="add-equip-btn">+ Agregar elemento</button>
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

    await import("../../../js/forms/f3/f3-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Direcci\u00f3n de Arte";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("autorizado").value = "Autorizado Test";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("celular").value = "3001234567";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
  }

  function mockOdsTemplate({ contentXml } = {}) {
    const xml = contentXml || buildF3ContentXml();
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
        expect(doc.save).toHaveBeenCalled();
        expect(doc.save.mock.calls[0][0]).toMatch(/^f3_.*\.pdf$/);
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
      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Proyecto Test");
        expect(allText).toContain("Direcci\u00f3n de Arte");
        expect(allText).toContain("Autorizado Test");
        expect(allText).toContain("TIUN123");
      });
    });

    it("should include dates in the PDF", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("btn-pdf").click();

      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("2026-01-01");
      });
    });
  });

  describe("PDF branch coverage", () => {
    it("should handle missing dates gracefully", async () => {
      const { generateF3PDF } = await import("../../../js/forms/f3/f3-pdf.js");
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();

      generateF3PDF({
        proyecto: "Proyecto Test",
        asignatura: "Test",
        docente: "Docente",
        autorizado: "Autorizado",
        "tipo-documento": "CC",
        "numero-documento": "123",
        tiun: "TIUN",
        celular: "300",
        lugar: "Lugar",
        "fecha-retiro": "",
        "fecha-entrega": "",
        observaciones: "",
        equipos: [],
      });

      await vi.waitFor(() => {
        expect(doc.save).toHaveBeenCalledWith("f3_proyecto_test_autorizado_hoy.pdf");
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
      document.getElementById("autorizado").value =
        "Nombre muy largo del autorizado que debe dividirse en varias l\u00edneas por el ancho de la celda";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should generate PDF via direct generateF3PDF call", async () => {
      const { generateF3PDF } = await import("../../../js/forms/f3/f3-pdf.js");
      const doc = createMockJsPDF();
      mockOdsTemplate();

      generateF3PDF({
        proyecto: "Direct Test",
        asignatura: "Test Subject",
        docente: "Teacher",
        autorizado: "Authorized Person",
        "tipo-documento": "CC",
        "numero-documento": "987654",
        tiun: "TIUN456",
        celular: "3109876543",
        lugar: "Location",
        "fecha-retiro": "2026-02-01T08:00",
        "fecha-entrega": "2026-02-01T18:00",
        observaciones: "",
        equipos: [],
      });

      await vi.waitFor(() => {
        expect(doc.save).toHaveBeenCalledWith("f3_direct_test_authorized_person_2026-02-01.pdf");
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Direct Test");
      });
    });

    it("should handle equipment rows in template", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.querySelector('input[name="equipo-item"]').value = "1";
      document.querySelector('input[name="equipo-tipo"]').value = "Iluminaci\u00f3n";
      document.querySelector('input[name="equipo-cantidad"]').value = "2";
      document.querySelector('input[name="equipo-codigo"]').value = "COD-001";
      document.querySelector('input[name="equipo-elemento"]').value = "Reflector";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        expect(window.jspdf.jsPDF).toHaveBeenCalled();
      });
    });

    it("should handle multiple equipment rows", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      fillAllRequired();
      document.getElementById("add-equip-btn").click();
      const rows = document.querySelectorAll(".equip-row");
      rows[0].querySelector('input[name="equipo-item"]').value = "1";
      rows[0].querySelector('input[name="equipo-tipo"]').value = "Sonido";
      rows[0].querySelector('input[name="equipo-cantidad"]').value = "1";
      rows[0].querySelector('input[name="equipo-codigo"]').value = "COD-001";
      rows[0].querySelector('input[name="equipo-elemento"]').value = "Micrófono";
      rows[1].querySelector('input[name="equipo-item"]').value = "2";
      rows[1].querySelector('input[name="equipo-tipo"]').value = "Video";
      rows[1].querySelector('input[name="equipo-cantidad"]').value = "3";
      rows[1].querySelector('input[name="equipo-codigo"]').value = "COD-002";
      rows[1].querySelector('input[name="equipo-elemento"]').value = "Cámara";

      document.getElementById("btn-pdf").click();
      await vi.waitFor(() => {
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("Micrófono");
        expect(allText).toContain("Cámara");
      });
    });

    it("should trigger overflow page when more than 14 equipment items", async () => {
      const doc = createMockJsPDF();
      mockOdsTemplate();
      const equipos = [];
      for (let i = 0; i < 16; i++) {
        equipos.push({
          item: String(i + 1),
          tipo: "Tipo",
          cantidad: "1",
          codigo: "COD-" + i,
          elemento: "Elemento " + (i + 1),
        });
      }
      fillAllRequired();

      const { generateF3PDF } = await import("../../../js/forms/f3/f3-pdf.js");
      await generateF3PDF({
        proyecto: "Overflow Test",
        asignatura: "Test",
        docente: "Docente",
        autorizado: "Autorizado",
        "tipo-documento": "CC",
        "numero-documento": "123",
        tiun: "TIUN",
        celular: "300",
        lugar: "Lugar",
        "fecha-retiro": "2026-01-01T10:00",
        "fecha-entrega": "2026-01-01T12:00",
        observaciones: "",
        equipos,
      });

      await vi.waitFor(() => {
        expect(doc.addPage).toHaveBeenCalled();
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("continuación");
        expect(allText).toContain("Item");
        expect(allText).toContain("Tipo");
        expect(allText).toContain("Cant.");
        expect(allText).toContain("Código");
        expect(allText).toContain("Elemento");
        expect(allText).toContain("Elemento 15");
        expect(allText).toContain("Elemento 16");
      });
    });

    it("should handle only fecha-retiro without fecha-entrega", async () => {
      const doc = createMockJsPDF();
      const { generateF3PDF } = await import("../../../js/forms/f3/f3-pdf.js");
      mockOdsTemplate();

      await generateF3PDF({
        proyecto: "No Entrega",
        asignatura: "Test",
        docente: "Docente",
        autorizado: "Autorizado",
        "tipo-documento": "CC",
        "numero-documento": "123",
        tiun: "TIUN",
        celular: "300",
        lugar: "Lugar",
        "fecha-retiro": "2026-01-01T10:00",
        "fecha-entrega": "",
        observaciones: "",
        equipos: [],
      });

      await vi.waitFor(() => {
        expect(doc.save).toHaveBeenCalled();
        const allText = doc.text.mock.calls.map((c) => String(c[0])).join(" ");
        expect(allText).toContain("2026-01-01");
      });
    });
  });
});
