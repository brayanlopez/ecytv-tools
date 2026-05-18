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

  setRowText(6, 2, d.proyecto);
  setRowText(6, 4, d.asignatura);
  setRowText(7, 2, d["directo-responsable"]);
  setRowText(7, 4, d.tiun);

  const salas = d.salas || [];
  for (let i = 0; i < 4; i++) {
    const ri = 10 + i;
    const row = rows[ri];
    if (!row) break;
    if (i < salas.length) {
      const s = salas[i];
      setRowText(ri, 1, s.nombre || "");
      setRowText(ri, 2, s.fecha || "");
      setRowText(ri, 3, s["hora-inicio"] || "");
      setRowText(ri, 4, s["hora-fin"] || "");
    } else {
      setRowText(ri, 1, "");
      setRowText(ri, 2, "");
      setRowText(ri, 3, "");
      setRowText(ri, 4, "");
    }
  }

  setRowText(15, 2, d.observaciones || "");
  setRowText(16, 2, d.docente);

  setRowText(22, 2, d["directo-responsable"]);
  setRowText(23, 2, d["numero-documento"] || "");

  return { salas, overflowStart: salas.length > 4 ? 4 : -1 };
}

export async function generateF4PDF(formData) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    window.EcytvUI.showSnackbar(
      "Error al cargar la librería PDF. Verifica tu conexión a internet.",
      "error",
    );
    return;
  }

  try {
    const resp = await fetch("data/f4-template.ods");
    if (!resp.ok) throw new Error("No se pudo cargar la plantilla ODS");
    const buf = await resp.arrayBuffer();

    const zip = await JSZip.loadAsync(buf);
    const contentXml = await zip.file("content.xml").async("string");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentXml, "text/xml");
    const { colWidths, rows, styleMap } = parseOds(xmlDoc);

    const { salas, overflowStart } = injectData(rows, formData);

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
      const salasPerPage = 4;
      const remaining = salas.slice(overflowStart);
      for (let i = 0; i < remaining.length; i += salasPerPage) {
        doc.addPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(
          "SOLICITUD DE RESERVA Y PRÉSTAMO SALAS DE EDICIÓN (continuación)",
          pageWidth / 2,
          offsetY,
          { align: "center" },
        );
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        let y = offsetY + 15;
        const rowH = 8;
        doc.line(pageWidth - offsetX, y, offsetX, y);
        doc.text("Sala", offsetX + 5, y + rowH * 0.7);
        doc.text("Fecha", offsetX + 50, y + rowH * 0.7);
        doc.text("Inicio", offsetX + 90, y + rowH * 0.7);
        doc.text("Fin", offsetX + 130, y + rowH * 0.7);
        y += rowH;
        doc.line(pageWidth - offsetX, y, offsetX, y);

        const chunk = remaining.slice(i, i + salasPerPage);
        for (const s of chunk) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(s.nombre || "", offsetX + 5, y + rowH * 0.7);
          doc.text(s.fecha || "", offsetX + 50, y + rowH * 0.7);
          doc.text(s["hora-inicio"] || "", offsetX + 90, y + rowH * 0.7);
          doc.text(s["hora-fin"] || "", offsetX + 130, y + rowH * 0.7);
          y += rowH;
        }
        doc.line(pageWidth - offsetX, y, offsetX, y);
      }
    }

    const salaDate = salas.length > 0 ? salas[0].fecha : new Date().toISOString().split("T")[0];
    doc.save(
      buildFilename({
        formId: "f4",
        project: formData.proyecto,
        username: formData["directo-responsable"],
        date: salaDate,
      }) + ".pdf",
    );
  } catch (err) {
    window.EcytvUI.showSnackbar("Error al generar el archivo PDF: " + err.message, "error");
  }
}
