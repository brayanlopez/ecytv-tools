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
  setRowText(7, 2, d.responsable);
  setRowText(7, 4, d.tiun);
  setRowText(8, 2, d.lugar);
  setRowText(8, 4, d.celular);
  const esInterno = d["tipo-prestamo"] === "Interno";
  setRowText(9, 2, esInterno ? "X" : "");
  setRowText(9, 4, esInterno ? "" : "X");

  if (d["fecha-retiro"]) {
    const parts = d["fecha-retiro"].split("T");
    setRowText(11, 2, parts[0]);
    setRowText(12, 2, parts[1] || "");
  }
  if (d["fecha-entrega"]) {
    const parts = d["fecha-entrega"].split("T");
    setRowText(11, 4, parts[0]);
    setRowText(12, 4, parts[1] || "");
  }

  const equipos = d.equipos || [];
  for (let i = 0; i < 14; i++) {
    const ri = 16 + i;
    const row = rows[ri];
    if (!row) break;
    if (i < equipos.length) {
      const eq = equipos[i];
      setRowText(ri, 1, eq.item || "");
      setRowText(ri, 2, eq.nombre || "");
      setRowText(ri, 3, eq.consecutivo || "");
    } else {
      setRowText(ri, 1, "");
      setRowText(ri, 2, "");
      setRowText(ri, 3, "");
    }
  }

  setRowText(30, 2, d.observaciones);
  setRowText(31, 2, d.docente);
  setRowText(31, 4, "_________________________");
  setRowText(36, 2, "NOMBRE: " + d.responsable);
  setRowText(37, 1, "C.C.: " + d.tiun);

  return { equipos, overflowStart: equipos.length > 14 ? 14 : -1 };
}

export async function generateF1PDF(formData, opts = {}) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    window.EcytvUI.showSnackbar(
      "Error al cargar la librería PDF. Verifica tu conexión a internet.",
      "error",
    );
    return;
  }

  try {
    const resp = await fetch("data/f1-template.ods");
    if (!resp.ok) throw new Error("No se pudo cargar la plantilla ODS");
    const buf = await resp.arrayBuffer();

    const zip = await JSZip.loadAsync(buf);
    const contentXml = await zip.file("content.xml").async("string");
    const imageFile = zip.file("media/image1.jpg");
    let imageData = null;
    if (imageFile) {
      const base64 = await imageFile.async("base64");
      const data = "data:image/jpeg;base64," + base64;
      let imgW = 0;
      let imgH = 0;
      try {
        const dims = await Promise.race([
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () =>
              resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve({ w: 0, h: 0 });
            img.src = data;
          }),
          new Promise((resolve) =>
            setTimeout(() => resolve({ w: 0, h: 0 }), 500),
          ),
        ]);
        imgW = dims.w;
        imgH = dims.h;
      } catch (_) {
        // fallback: dimensions stay 0
      }
      imageData = { data, width: imgW, height: imgH };
    }

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
      imageData,
    );

    if (overflowStart > 0) {
      const equipPerPage = 14;
      const remaining = equipos.slice(overflowStart);
      for (let i = 0; i < remaining.length; i += equipPerPage) {
        doc.addPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(
          "SOLICITUD DE RESERVA Y PRESTAMO DE EQUIPOS (continuación)",
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
        doc.text("Equipo", offsetX + 25, y + rowH * 0.7);
        doc.text("Consecutivo", offsetX + 100, y + rowH * 0.7);
        y += rowH;
        doc.line(pageWidth - offsetX, y, offsetX, y);

        const chunk = remaining.slice(i, i + equipPerPage);
        for (const eq of chunk) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(eq.item || "", offsetX + 5, y + rowH * 0.7);
          doc.text(eq.nombre || "", offsetX + 25, y + rowH * 0.7);
          doc.text(eq.consecutivo || "", offsetX + 100, y + rowH * 0.7);
          y += rowH;
        }
        doc.line(pageWidth - offsetX, y, offsetX, y);
      }
    }

    if (opts.returnBytes) {
      return doc.output("arraybuffer");
    }
    doc.save(
      buildFilename({
        formId: "f1",
        project: formData.proyecto,
        username: formData.responsable,
        date: formData["fecha-retiro"],
      }) + ".pdf",
    );
  } catch (err) {
    window.EcytvUI.showSnackbar(
      "Error al generar el archivo PDF: " + err.message,
      "error",
    );
  }
}
