const NS = {
  TABLE: "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
  TEXT: "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
  STYLE: "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
  FO: "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
  DRAW: "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
  OFFICE: "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
};

function ptToMm(pt) {
  return parseFloat(pt) * 0.3528;
}
function cmToMm(cm) {
  return parseFloat(cm) * 10;
}
function inToMm(inch) {
  return parseFloat(inch) * 25.4;
}
function toMm(val) {
  if (!val) return 0;
  if (val.endsWith("cm")) return cmToMm(val);
  if (val.endsWith("pt")) return ptToMm(val);
  if (val.endsWith("in")) return inToMm(val);
  if (val.endsWith("mm")) return parseFloat(val);
  return parseFloat(val) || 0;
}

function getAttr(el, ns, local) {
  return el ? el.getAttributeNS(ns, local) : null;
}

function getStyleProp(xmlDoc, styleName, family, propNs, propName) {
  const nsPrefix = propNs === NS.STYLE ? "style" : "fo";
  const styles = xmlDoc.getElementsByTagNameNS(NS.STYLE, "style");
  for (const s of styles) {
    if (getAttr(s, NS.STYLE, "name") !== styleName) continue;
    if (getAttr(s, NS.STYLE, "family") !== family) continue;
    const childTag =
      family === "table-cell"
        ? "table-cell-properties"
        : family === "table-row"
          ? "table-row-properties"
          : family === "table-column"
            ? "table-column-properties"
            : null;
    if (!childTag) return null;
    const child = s.getElementsByTagNameNS(NS.STYLE, childTag)[0];
    if (!child) return null;
    return getAttr(child, propNs, propName);
  }
  return null;
}

const FONT_MAP = {
  Cambria: "times",
  Calibri: "helvetica",
  Arial: "helvetica",
};

function mapFont(name) {
  return FONT_MAP[name] || "helvetica";
}

function parseBorderString(str) {
  if (!str || str === "none") return null;
  const parts = str.split(/\s+/);
  let width = 0.15;
  let color = "#000000";
  for (const p of parts) {
    if (p === "thin") width = 0.15;
    else if (p === "medium") width = 0.5;
    else if (p === "thick") width = 1.0;
    else if (p.startsWith("#")) color = p;
    else if (/^[\d.]+(?:pt|mm)?$/.test(p)) width = toMm(p);
  }
  return { width, color };
}

function getBorders(cp) {
  const b = {};
  const shorthand = cp ? getAttr(cp, NS.FO, "border") : null;
  if (shorthand && shorthand !== "none" && !shorthand.includes("none")) {
    const parsed = parseBorderString(shorthand);
    if (parsed) b.top = b.bottom = b.left = b.right = parsed;
    return b;
  }
  for (const edge of ["top", "bottom", "left", "right"]) {
    const v = cp ? getAttr(cp, NS.FO, "border-" + edge) : null;
    if (v && v !== "none" && !v.includes("none")) {
      const parsed = parseBorderString(v);
      if (parsed) b[edge] = parsed;
    }
  }
  return b;
}

function parseCellStyles(xmlDoc) {
  const styles = {};
  const els = xmlDoc.getElementsByTagNameNS(NS.STYLE, "style");
  for (const el of els) {
    const name = getAttr(el, NS.STYLE, "name");
    if (!name || getAttr(el, NS.STYLE, "family") !== "table-cell") continue;
    const cp = el.getElementsByTagNameNS(NS.STYLE, "table-cell-properties")[0];
    const tp = el.getElementsByTagNameNS(NS.STYLE, "text-properties")[0];
    const pp = el.getElementsByTagNameNS(NS.STYLE, "paragraph-properties")[0];
    const borders = getBorders(cp);
    const bg = cp ? getAttr(cp, NS.FO, "background-color") : null;
    const verticalAlign = cp ? getAttr(cp, NS.STYLE, "vertical-align") : null;
    const textAlign = pp ? getAttr(pp, NS.FO, "text-align") : null;
    styles[name] = {
      borders,
      bgColor: bg && bg !== "transparent" ? bg : null,
      fontName: tp ? getAttr(tp, NS.STYLE, "font-name") || "Calibri" : "Calibri",
      fontSize: tp ? parseFloat(getAttr(tp, NS.FO, "font-size") || "11") : 11,
      fontWeight: tp ? getAttr(tp, NS.FO, "font-weight") || "normal" : "normal",
      color: tp ? getAttr(tp, NS.FO, "color") || "#000000" : "#000000",
      textAlign,
      verticalAlign: verticalAlign === "automatic" ? null : verticalAlign,
    };
  }
  return styles;
}

function parseColumns(xmlDoc, table) {
  const colEls = table.getElementsByTagNameNS(NS.TABLE, "table-column");
  const widths = [];
  for (const col of colEls) {
    const styleName = getAttr(col, NS.TABLE, "style-name");
    const repeat = parseInt(getAttr(col, NS.TABLE, "number-columns-repeated") || "1", 10);
    const widthStr = getStyleProp(xmlDoc, styleName, "table-column", NS.STYLE, "column-width");
    const w = widthStr ? toMm(widthStr) : 20;
    for (let i = 0; i < repeat && i < 20; i++) widths.push(w);
    if (widths.length >= 20) break;
  }
  return widths.slice(0, 10);
}

function parseRows(xmlDoc, table, colWidths) {
  const rowEls = Array.from(table.childNodes).filter(
    (n) => n.namespaceURI === NS.TABLE && n.localName === "table-row",
  );
  const result = [];

  for (const rowEl of rowEls) {
    const styleName = getAttr(rowEl, NS.TABLE, "style-name");
    const repeat = parseInt(getAttr(rowEl, NS.TABLE, "number-rows-repeated") || "1", 10);
    const heightStr = getStyleProp(xmlDoc, styleName, "table-row", NS.STYLE, "row-height");
    const height = heightStr ? toMm(heightStr) : 8;

    if (repeat > 50) {
      result.push({ height, cells: [], isPadding: true });
      continue;
    }

    const cells = [];
    let ci = 0;
    const cellEls = Array.from(rowEl.childNodes).filter(
      (n) => n.namespaceURI === NS.TABLE && n.localName === "table-cell",
    );

    for (const cell of cellEls) {
      if (ci >= 10) break;
      const span = parseInt(getAttr(cell, NS.TABLE, "number-columns-spanned") || "1", 10);
      const crepeat = parseInt(getAttr(cell, NS.TABLE, "number-columns-repeated") || "1", 10);
      const cellStyleName = getAttr(cell, NS.TABLE, "style-name");
      const ncols = Math.max(span, crepeat);

      let w = 0;
      for (let i = 0; i < ncols && ci + i < colWidths.length; i++) w += colWidths[ci + i];

      const p = cell.getElementsByTagNameNS(NS.TEXT, "p")[0];
      const text = p ? p.textContent : "";
      const frame = cell.getElementsByTagNameNS(NS.DRAW, "frame")[0];
      const isImage = !!frame;

      cells.push({
        ci,
        width: w,
        span: ncols,
        styleName: cellStyleName,
        text,
        isImage,
      });
      ci += ncols;
    }

    for (let r = 0; r < repeat; r++) {
      result.push({
        height,
        cells: cells.map((c) => ({ ...c })),
        isPadding: false,
      });
    }
  }

  return result;
}

export function parseOds(xmlDoc) {
  const styleMap = parseCellStyles(xmlDoc);
  const tables = xmlDoc.getElementsByTagNameNS(NS.TABLE, "table");
  if (!tables.length) throw new Error("No se encontró la tabla en la plantilla");
  const table = tables[0];
  const colWidths = parseColumns(xmlDoc, table);
  const rows = parseRows(xmlDoc, table, colWidths);
  while (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.isPadding) {
      rows.pop();
      continue;
    }
    const allSpacer = last.cells.every((c) => c.span >= 1000);
    if (allSpacer) rows.pop();
    else break;
  }
  return { colWidths, rows, styleMap };
}

export {
  NS,
  mapFont,
  toMm,
  getAttr,
  getStyleProp,
  parseBorderString,
  getBorders,
  parseCellStyles,
  parseColumns,
  parseRows,
};
