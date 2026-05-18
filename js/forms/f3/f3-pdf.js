import { parseOds } from "../common/parse-ods.js";
import { renderPage } from "../common/ods-pdf-renderer.js";
import { buildFilename } from "../common/filename.js";

function injectData(rows, formData) {
  const d = formData;

  function setRowText(rowIdx, cellIdx, text) {
    const row = rows[rowIdx];
    if (!row) return;
    const cell = row.cells[cellIdx];
    if (cell) cell.text = text;
  }

  setRowText(5, 2, d.proyecto);
  setRowText(5, 4, d.asignatura);
  setRowText(6, 2, d.autorizado);
  setRowText(6, 4, d.tiun);
  setRowText(7, 2, d.lugar);
  setRowText(7, 4, d.celular);

  if (d["fecha-retiro"]) {
    const parts = d["fecha-retiro"].split("T");
    setRowText(8, 2, parts[0]);
    setRowText(9, 2, parts[1] || "");
  }
  if (d["fecha-entrega"]) {
    const parts = d["fecha-entrega"].split("T");
    setRowText(8, 4, parts[0]);
    setRowText(9, 4, parts[1] || "");
  }

  const equipos = d.equipos || [];
  for (let i = 0; i < 14; i++) {
    const ri = 12 + i;
    const row = rows[ri];
    if (!row) break;
    if (i < equipos.length) {
      const eq = equipos[i];
      setRowText(ri, 1, eq.item || "");
      setRowText(ri, 2, eq.tipo || "");
      setRowText(ri, 3, eq.cantidad || "");
      setRowText(ri, 4, eq.codigo || "");
      setRowText(ri, 5, eq.elemento || "");
      setRowText(ri, 6, "");
    } else {
      setRowText(ri, 1, "");
      setRowText(ri, 2, "");
      setRowText(ri, 3, "");
      setRowText(ri, 4, "");
      setRowText(ri, 5, "");
      setRowText(ri, 6, "");
    }
  }

  setRowText(26, 2, d.docente);
  setRowText(32, 2, d.autorizado);
  setRowText(33, 2, d["numero-documento"] || "");

  return { equipos, overflowStart: equipos.length > 14 ? 14 : -1 };
}

export async function generateF3PDF(formData) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    window.EcytvUI.showSnackbar(
      "Error al cargar la librería PDF. Verifica tu conexión a internet.",
      "error",
    );
    return;
  }

  try {
    const resp = await fetch("data/f3-template.ods");
    if (!resp.ok) throw new Error("No se pudo cargar la plantilla ODS");
    const buf = await resp.arrayBuffer();

    const zip = await JSZip.loadAsync(buf);
    const contentXml = await zip.file("content.xml").async("string");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentXml, "text/xml");
    const { colWidths, rows, styleMap } = parseOds(xmlDoc);

    const { equipos, overflowStart } = injectData(rows, formData);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = 210;
    const pageHeight = 297;
    const offsetX = 10;
    const offsetY = 10;

    const totalTemplateWidth = colWidths.reduce((a, b) => a + b, 0);
    const usableWidth = pageWidth - offsetX * 2;
    const scale = Math.min(1, usableWidth / totalTemplateWidth);

    renderPage(
      doc,
      rows,
      colWidths,
      styleMap,
      offsetX,
      offsetY,
      pageHeight,
      scale,
      rows.length,
      null,
    );

    if (overflowStart > 0) {
      const equipPerPage = 14;
      const remaining = equipos.slice(overflowStart);
      for (let i = 0; i < remaining.length; i += equipPerPage) {
        doc.addPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(
          "SOLICITUD DE RESERVA Y PRESTAMO DE ELEMENTOS BODEGA DE ARTE (continuación)",
          pageWidth / 2,
          offsetY,
          { align: "center" },
        );
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        let y = offsetY + 15;
        const rowH = 8;
        doc.line(pageWidth - offsetX, y, offsetX, y);
        doc.setFont("helvetica", "bold");
        doc.text("Item", offsetX + 5, y + rowH * 0.7);
        doc.text("Tipo", offsetX + 20, y + rowH * 0.7);
        doc.text("Cant.", offsetX + 50, y + rowH * 0.7);
        doc.text("Código", offsetX + 70, y + rowH * 0.7);
        doc.text("Elemento", offsetX + 100, y + rowH * 0.7);
        y += rowH;
        doc.line(pageWidth - offsetX, y, offsetX, y);

        const chunk = remaining.slice(i, i + equipPerPage);
        for (const eq of chunk) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(eq.item || "", offsetX + 5, y + rowH * 0.7);
          doc.text(eq.tipo || "", offsetX + 20, y + rowH * 0.7);
          doc.text(eq.cantidad || "", offsetX + 50, y + rowH * 0.7);
          doc.text(eq.codigo || "", offsetX + 70, y + rowH * 0.7);
          doc.text(eq.elemento || "", offsetX + 100, y + rowH * 0.7);
          y += rowH;
        }
        doc.line(pageWidth - offsetX, y, offsetX, y);
      }
    }

    doc.save(
      buildFilename({
        formId: "f3",
        project: formData.proyecto,
        username: formData.autorizado,
        date: formData["fecha-retiro"],
      }) + ".pdf",
    );
  } catch (err) {
    window.EcytvUI.showSnackbar("Error al generar el archivo PDF: " + err.message, "error");
  }
}
