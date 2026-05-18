import { parseOds, mapFont } from "./f1-parse-ods.js";

function drawCellBorders(doc, x, y, w, h, borders) {
  if (!borders) return;
  const map = {
    top: [x, y, x + w, y],
    bottom: [x, y + h, x + w, y + h],
    left: [x, y, x, y + h],
    right: [x + w, y, x + w, y + h],
  };
  for (const [edge, coords] of Object.entries(map)) {
    const b = borders[edge];
    if (b) {
      doc.setDrawColor(b.color);
      doc.setLineWidth(b.width);
      doc.line(...coords);
    }
  }
}

function renderRow(
  doc,
  rows,
  rowIdx,
  styleMap,
  offsetX,
  offsetY,
  scale,
  imageData,
) {
  const row = rows[rowIdx];
  if (!row || row.isPadding) return 0;

  const y0 = offsetY;
  const origH = row.height * scale;

  // First pass: compute text wrapping per cell, track expanded height
  const cells = [];
  let maxH = origH;
  let x = offsetX;

  for (const cell of row.cells) {
    const cw = cell.width * scale;
    const st = cell.styleName ? styleMap[cell.styleName] : null;
    const info = { cw, st, cell, finalLines: [], lh: 0 };
    cells.push(info);

    if (!cell.text) continue;

    const ft = (st?.fontSize || 11) * scale;
    info.lh = (ft / 72) * 25.4 * 1.15;
    doc.setFontSize(ft);
    doc.setFont(
      mapFont(st?.fontName || "Calibri"),
      st?.fontWeight === "bold" ? "bold" : "normal",
    );
    doc.setTextColor(st?.color || "#000000");

    const availableW = Math.max(cw - 2, 1);
    const rawLines = cell.text.split("\n");
    const lines = [];
    for (const raw of rawLines) {
      if (doc.getTextWidth(raw) > availableW) {
        const words = raw.split(" ");
        let buf = "";
        for (const word of words) {
          const test = buf ? buf + " " + word : word;
          if (doc.getTextWidth(test) > availableW && buf) {
            lines.push(buf);
            buf = word;
          } else {
            buf = test;
          }
        }
        if (buf) lines.push(buf);
      } else {
        lines.push(raw);
      }
    }
    for (const line of lines) {
      if (doc.getTextWidth(line) > availableW) {
        let buf = "";
        for (const ch of line) {
          const test = buf + ch;
          if (doc.getTextWidth(test) > availableW && buf) {
            info.finalLines.push(buf);
            buf = ch;
          } else {
            buf = test;
          }
        }
        if (buf) info.finalLines.push(buf);
      } else {
        info.finalLines.push(line);
      }
    }

    const textHeight = info.finalLines.length * info.lh;
    if (textHeight > maxH) maxH = textHeight + 2;
  }

  // Second pass: draw all cells using consistent maxH
  x = offsetX;
  for (const ci of cells) {
    const { cell, cw, st, finalLines, lh } = ci;

    if (cell.isImage && imageData) {
      const imgH =
        imageData.width && imageData.height
          ? cw * (imageData.height / imageData.width)
          : origH;
      doc.addImage(imageData.data, "JPEG", x, y0, cw, imgH);
    }
    if (st?.bgColor) {
      doc.setFillColor(st.bgColor);
      doc.rect(x, y0, cw, maxH, "F");
    }
    drawCellBorders(doc, x, y0, cw, maxH, st?.borders);

    if (cell.text && finalLines.length > 0) {
      const ft = (st?.fontSize || 11) * scale;
      doc.setFontSize(ft);
      doc.setFont(
        mapFont(st?.fontName || "Calibri"),
        st?.fontWeight === "bold" ? "bold" : "normal",
      );
      doc.setTextColor(st?.color || "#000000");

      const textAlign = st?.textAlign || "start";
      let cellX, alignOpts;
      if (textAlign === "center") {
        cellX = x + cw / 2;
        alignOpts = { align: "center" };
      } else if (textAlign === "end" || textAlign === "right") {
        cellX = x + cw - 1;
        alignOpts = { align: "right" };
      } else {
        cellX = x + 1;
        alignOpts = null;
      }

      const valign = st?.verticalAlign || "middle";
      let py;
      if (valign === "top") {
        py = y0 + lh * 0.85;
      } else if (valign === "bottom") {
        py = y0 + maxH - lh * 0.35 - (finalLines.length - 1) * lh;
      } else {
        const th = finalLines.length * lh;
        py = y0 + (maxH - th) / 2 + lh * 0.75;
      }

      for (let pi = 0; pi < finalLines.length; pi++) {
        doc.text(finalLines[pi], cellX, py + pi * lh, alignOpts);
      }
    }
    x += cw;
  }

  return maxH;
}

function renderPage(
  doc,
  rows,
  colWidths,
  styleMap,
  offsetX,
  offsetY,
  pageHeight,
  scale,
  limitRow,
  imageData,
) {
  const end = limitRow || rows.length;
  const bottomMargin = offsetY;

  let currentY = offsetY;

  for (let i = 0; i < end; i++) {
    const row = rows[i];

    if (row.isPadding) continue;

    const scaledHeight = row.height * scale;

    if (currentY + scaledHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = offsetY;
    }

    const actualHeight = renderRow(
      doc,
      rows,
      i,
      styleMap,
      offsetX,
      currentY,
      scale,
      imageData,
    );

    currentY += actualHeight;
  }
}

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

export async function generateF1PDF(formData) {
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
            setTimeout(() => resolve({ w: 0, h: 0 }), 50),
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

    doc.save("F1-Solicitud-Prestamo-Equipos.pdf");
  } catch (err) {
    window.EcytvUI.showSnackbar(
      "Error al generar el archivo PDF: " + err.message,
      "error",
    );
  }
}
