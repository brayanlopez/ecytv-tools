import { vi } from "vitest";

/**
 * Creates a mock jsPDF document with chainable methods.
 * Returns the mock document object and sets window.jspdf.
 */
export function createMockJsPDF() {
  const doc = {
    setFillColor: vi.fn(function () {
      return doc;
    }),
    rect: vi.fn(function () {
      return doc;
    }),
    setDrawColor: vi.fn(function () {
      return doc;
    }),
    setLineWidth: vi.fn(function () {
      return doc;
    }),
    setTextColor: vi.fn(function () {
      return doc;
    }),
    setFontSize: vi.fn(function () {
      return doc;
    }),
    setFont: vi.fn(function () {
      return doc;
    }),
    text: vi.fn(function () {
      return doc;
    }),
    line: vi.fn(function () {
      return doc;
    }),
    addImage: vi.fn(function () {
      return doc;
    }),
    addPage: vi.fn(function () {
      return doc;
    }),
    getTextWidth: vi.fn(() => 0),
    save: vi.fn(),
  };

  window.jspdf = {
    jsPDF: vi.fn(function () {
      return doc;
    }),
  };

  return doc;
}

/**
 * Creates a mock PDFLib environment for F2 PDF tests.
 */
export function createMockPDFLib() {
  const font = { widthOfTextAtSize: vi.fn(() => 50) };
  const page = {
    getSize: vi.fn(() => ({ width: 596, height: 843 })),
    drawText: vi.fn(),
    drawLine: vi.fn(),
    drawRectangle: vi.fn(),
  };
  const doc = {
    getPages: vi.fn(() => [page]),
    embedFont: vi.fn(() => Promise.resolve(font)),
    save: vi.fn(() => Promise.resolve(new Uint8Array())),
  };

  window.PDFLib = {
    PDFDocument: { load: vi.fn(() => Promise.resolve(doc)) },
    rgb: vi.fn(() => ({})),
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "Helvetica-Bold",
    },
  };

  return { doc, page, font };
}

/**
 * Mocks fetch to return a successful ODS template response.
 */
export function mockOdsFetch(contentXml) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(contentXml).buffer;

  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(buffer),
  });

  window.JSZip = {
    loadAsync: vi.fn().mockResolvedValue({
      file: vi.fn((name) =>
        name === "content.xml" ? { async: () => Promise.resolve(contentXml) } : null,
      ),
    }),
  };
}

/**
 * Mocks fetch to return a generic PDF template response.
 */
export function mockPdfTemplateFetch(ok = true) {
  if (ok === false) {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
  } else {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
    });
  }
}
