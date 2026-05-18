import { mapFont } from "./parse-ods.js";

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

function renderRow(doc, rows, rowIdx, styleMap, offsetX, offsetY, scale, imageData) {
  const row = rows[rowIdx];
  if (!row || row.isPadding) return 0;

  const y0 = offsetY;
  const origH = row.height * scale;

  const cells = [];
  let maxH = origH;
  let x;

  for (const cell of row.cells) {
    const cw = cell.width * scale;
    const st = cell.styleName ? styleMap[cell.styleName] : null;
    const info = { cw, st, cell, finalLines: [], lh: 0 };
    cells.push(info);

    if (!cell.text) continue;

    const ft = (st?.fontSize || 11) * scale;
    info.lh = (ft / 72) * 25.4 * 1.15;
    doc.setFontSize(ft);
    doc.setFont(mapFont(st?.fontName || "Calibri"), st?.fontWeight === "bold" ? "bold" : "normal");
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

  x = offsetX;
  for (const ci of cells) {
    const { cell, cw, st, finalLines, lh } = ci;

    if (cell.isImage && imageData) {
      const imgH =
        imageData.width && imageData.height ? cw * (imageData.height / imageData.width) : origH;
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

    const actualHeight = renderRow(doc, rows, i, styleMap, offsetX, currentY, scale, imageData);

    currentY += actualHeight;
  }
}

export { drawCellBorders, renderRow, renderPage };
