import { describe, it, expect, beforeAll } from "vitest";
import {
  mapFont,
  toMm,
  parseBorderString,
  parseOds,
  parseCellStyles,
  getBorders,
} from "../../../js/forms/f1/f1-parse-ods.js";

const NS = {
  TABLE: "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
  TEXT: "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
  STYLE: "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
  FO: "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
  DRAW: "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
  OFFICE: "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
};

function buildMinimalXml(extraStyles, extraRows) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="${NS.OFFICE}"
  xmlns:table="${NS.TABLE}"
  xmlns:text="${NS.TEXT}"
  xmlns:style="${NS.STYLE}"
  xmlns:fo="${NS.FO}"
  xmlns:draw="${NS.DRAW}"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  office:version="1.3">
  <office:automatic-styles>
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="2cm"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15pt"/>
    </style:style>
    ${extraStyles || ""}
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1" table:number-columns-repeated="3"/>
        <table:table-row table:style-name="ro1">
          <table:table-cell table:style-name="ce1"><text:p>Hello</text:p></table:table-cell>
        </table:table-row>
        ${extraRows || ""}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}

function parseXml(xmlStr) {
  return new DOMParser().parseFromString(xmlStr, "text/xml");
}

describe("mapFont", () => {
  it("returns helvetica for unknown font", () => {
    expect(mapFont("Comic Sans")).toBe("helvetica");
  });

  it("returns helvetica for null/undefined", () => {
    expect(mapFont(null)).toBe("helvetica");
    expect(mapFont(undefined)).toBe("helvetica");
  });

  it("maps known fonts correctly", () => {
    expect(mapFont("Cambria")).toBe("times");
    expect(mapFont("Calibri")).toBe("helvetica");
    expect(mapFont("Arial")).toBe("helvetica");
  });
});

describe("toMm", () => {
  it("returns 0 for falsy input", () => {
    expect(toMm(null)).toBe(0);
    expect(toMm(undefined)).toBe(0);
    expect(toMm("")).toBe(0);
  });

  it("converts cm", () => {
    expect(toMm("2cm")).toBe(20);
  });

  it("converts pt", () => {
    expect(toMm("15.75pt")).toBeCloseTo(5.5566);
  });

  it("converts in", () => {
    expect(toMm("1in")).toBe(25.4);
  });

  it("parses mm suffix", () => {
    expect(toMm("10mm")).toBe(10);
  });

  it("falls back to parseFloat for unknown suffix", () => {
    expect(toMm("42px")).toBe(42);
  });

  it("returns 0 for non-numeric string", () => {
    expect(toMm("abc")).toBe(0);
  });
});

describe("parseBorderString", () => {
  it("returns null for falsy input", () => {
    expect(parseBorderString(null)).toBeNull();
    expect(parseBorderString(undefined)).toBeNull();
    expect(parseBorderString("")).toBeNull();
  });

  it("returns null for none", () => {
    expect(parseBorderString("none")).toBeNull();
  });

  it("parses thin border", () => {
    const r = parseBorderString("thin solid #ff0000");
    expect(r.width).toBe(0.15);
    expect(r.color).toBe("#ff0000");
  });

  it("parses medium border", () => {
    const r = parseBorderString("medium solid #00ff00");
    expect(r.width).toBe(0.5);
    expect(r.color).toBe("#00ff00");
  });

  it("parses thick border", () => {
    const r = parseBorderString("thick dashed #0000ff");
    expect(r.width).toBe(1.0);
    expect(r.color).toBe("#0000ff");
  });

  it("parses numeric width with pt", () => {
    const r = parseBorderString("2pt solid #000");
    expect(r.width).toBeCloseTo(0.7056);
    expect(r.color).toBe("#000");
  });

  it("parses numeric width without unit", () => {
    const r = parseBorderString("3 solid red");
    expect(r.width).toBe(3);
  });

  it("defaults when no color or size given", () => {
    const r = parseBorderString("thin");
    expect(r.width).toBe(0.15);
    expect(r.color).toBe("#000000");
  });
});

describe("getBorders", () => {
  it("handles null cp", () => {
    expect(getBorders(null)).toEqual({});
  });
});

describe("parseCellStyles", () => {
  it("parses styles with background-color and vertical-align", () => {
    const xml = buildMinimalXml(`
      <style:style style:name="ce-colored" style:family="table-cell">
        <style:table-cell-properties
          fo:border="medium solid #ccc"
          fo:background-color="#ffeeee"
          style:vertical-align="bottom"/>
      </style:style>
    `);
    const doc = parseXml(xml);
    const styles = parseCellStyles(doc);
    const st = styles["ce-colored"];
    expect(st.bgColor).toBe("#ffeeee");
    expect(st.verticalAlign).toBe("bottom");
    expect(st.borders.top.width).toBe(0.5);
  });

  it("parses styles with text properties", () => {
    const xml = buildMinimalXml(`
      <style:style style:name="ce-tp" style:family="table-cell">
        <style:table-cell-properties fo:border="thin solid #000"/>
        <style:text-properties
          style:font-name="Arial"
          fo:font-size="12pt"
          fo:font-weight="bold"
          fo:color="#333333"/>
      </style:style>
    `);
    const doc = parseXml(xml);
    const styles = parseCellStyles(doc);
    const st = styles["ce-tp"];
    expect(st.fontName).toBe("Arial");
    expect(st.fontSize).toBe(12);
    expect(st.fontWeight).toBe("bold");
    expect(st.color).toBe("#333333");
  });

  it("handles automatic vertical-align as null", () => {
    const xml = buildMinimalXml(`
      <style:style style:name="ce-auto" style:family="table-cell">
        <style:table-cell-properties
          style:vertical-align="automatic"/>
      </style:style>
    `);
    const doc = parseXml(xml);
    const styles = parseCellStyles(doc);
    expect(styles["ce-auto"].verticalAlign).toBeNull();
  });

  it("handles transparent background as null", () => {
    const xml = buildMinimalXml(`
      <style:style style:name="ce-trans" style:family="table-cell">
        <style:table-cell-properties
          fo:background-color="transparent"/>
      </style:style>
    `);
    const doc = parseXml(xml);
    const styles = parseCellStyles(doc);
    expect(styles["ce-trans"].bgColor).toBeNull();
  });

  it("handles style with text-align from paragraph-properties", () => {
    const xml = buildMinimalXml(`
      <style:style style:name="ce-center" style:family="table-cell">
        <style:table-cell-properties fo:border="thin solid #000"/>
        <style:paragraph-properties fo:text-align="center"/>
      </style:style>
    `);
    const doc = parseXml(xml);
    const styles = parseCellStyles(doc);
    expect(styles["ce-center"].textAlign).toBe("center");
  });

  it("handles style without cell-properties", () => {
    const xml = buildMinimalXml(`
      <style:style style:name="ce-nocp" style:family="table-cell"/>
    `);
    const doc = parseXml(xml);
    const styles = parseCellStyles(doc);
    const st = styles["ce-nocp"];
    expect(st.bgColor).toBeNull();
    expect(st.verticalAlign).toBeNull();
    expect(st.fontName).toBe("Calibri");
    expect(st.fontSize).toBe(11);
    expect(st.fontWeight).toBe("normal");
    expect(st.color).toBe("#000000");
  });
});

describe("parseOds", () => {
  it("throws when no table element", () => {
    const xml = `<?xml version="1.0"?><root/>`;
    const doc = parseXml(xml);
    expect(() => parseOds(doc)).toThrow("No se encontró la tabla en la plantilla");
  });

  it("strips trailing padding rows", () => {
    const xml = buildMinimalXml(
      "",
      `
      <table:table-row table:style-name="ro1" table:number-rows-repeated="100">
        <table:table-cell table:number-columns-repeated="16384"><text:p/></table:table-cell>
      </table:table-row>
    `,
    );
    const doc = parseXml(xml);
    const result = parseOds(doc);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].cells[0].text).toBe("Hello");
  });

  it("keeps rows with some non-spacer cells", () => {
    const xml = buildMinimalXml(
      "",
      `
      <table:table-row table:style-name="ro1">
        <table:table-cell><text:p>Trailing</text:p></table:table-cell>
      </table:table-row>
    `,
    );
    const doc = parseXml(xml);
    const result = parseOds(doc);
    expect(result.rows.length).toBe(2);
    expect(result.rows[1].cells[0].text).toBe("Trailing");
  });

  it("handles image frame cells", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="${NS.OFFICE}"
  xmlns:table="${NS.TABLE}"
  xmlns:text="${NS.TEXT}"
  xmlns:style="${NS.STYLE}"
  xmlns:fo="${NS.FO}"
  xmlns:draw="${NS.DRAW}"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  office:version="1.3">
  <office:automatic-styles>
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="2cm"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15pt"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1" table:number-columns-repeated="3"/>
        <table:table-row table:style-name="ro1">
          <table:table-cell>
            <draw:frame draw:style-name="fr1" draw:layer="layout">
              <draw:image xlink:href="media/image1.jpg"/>
            </draw:frame>
          </table:table-cell>
        </table:table-row>
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
    const doc = parseXml(xml);
    const result = parseOds(doc);
    expect(result.rows[0].cells[0].isImage).toBe(true);
  });

  it("parses columns with inches unit", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="${NS.OFFICE}"
  xmlns:table="${NS.TABLE}"
  xmlns:text="${NS.TEXT}"
  xmlns:style="${NS.STYLE}"
  xmlns:fo="${NS.FO}"
  xmlns:draw="${NS.DRAW}"
  office:version="1.3">
  <office:automatic-styles>
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="1in"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="10mm"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15pt"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-column table:style-name="co2"/>
        <table:table-row table:style-name="ro1">
          <table:table-cell><text:p>Test</text:p></table:table-cell>
        </table:table-row>
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
    const doc = parseXml(xml);
    const result = parseOds(doc);
    expect(result.colWidths[0]).toBe(25.4); // 1in = 25.4mm
    expect(result.colWidths[1]).toBe(10); // 10mm
    expect(result.colWidths.length).toBe(2);
  });

  it("handles rows without height style", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="${NS.OFFICE}"
  xmlns:table="${NS.TABLE}"
  xmlns:text="${NS.TEXT}"
  xmlns:style="${NS.STYLE}"
  xmlns:fo="${NS.FO}"
  xmlns:draw="${NS.DRAW}"
  office:version="1.3">
  <office:automatic-styles>
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="2cm"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-row>
          <table:table-cell><text:p>NoStyle</text:p></table:table-cell>
        </table:table-row>
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
    const doc = parseXml(xml);
    const result = parseOds(doc);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].height).toBe(8);
  });

  it("parses columns without width style", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="${NS.OFFICE}"
  xmlns:table="${NS.TABLE}"
  xmlns:text="${NS.TEXT}"
  xmlns:style="${NS.STYLE}"
  xmlns:fo="${NS.FO}"
  xmlns:draw="${NS.DRAW}"
  office:version="1.3">
  <office:automatic-styles/>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column/>
        <table:table-row>
          <table:table-cell><text:p>NoColStyle</text:p></table:table-cell>
        </table:table-row>
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
    const doc = parseXml(xml);
    const result = parseOds(doc);
    expect(result.colWidths[0]).toBe(20);
  });
});
