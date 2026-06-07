import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createMockJsPDF } from "../../fixtures/mock-pdf.js";
import { generateCombinedPDF } from "../../../js/forms/f1-f2-wizard/f1-f2-wizard-pdf.js";

function createMockPDFLib() {
  const f1F2Page = {};
  const f1F2Doc = {
    getPageIndices: vi.fn(() => [0]),
    getPage: vi.fn(() => f1F2Page),
    copyPages: vi.fn(() => Promise.resolve([f1F2Page])),
  };
  const mergedPage = {};
  const mergedDoc = {
    addPage: vi.fn(),
    save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4, 5]))),
    copyPages: vi.fn(() => Promise.resolve([mergedPage])),
  };

  window.PDFLib = {
    PDFDocument: {
      create: vi.fn(() => Promise.resolve(mergedDoc)),
      load: vi.fn(() => Promise.resolve(f1F2Doc)),
    },
  };

  return { f1F2Doc, mergedDoc, f1F2Page, mergedPage };
}

function mockImageFile() {
  const blob = new Blob(["fake-image-data"], { type: "image/jpeg" });
  return new File([blob], "carnet.jpg", { type: "image/jpeg" });
}

function mockPdfFile() {
  const blob = new Blob(["fake-pdf"], { type: "application/pdf" });
  return new File([blob], "carnet.pdf", { type: "application/pdf" });
}

function mockFileReader() {
  const fakeDataUrl = "data:image/jpeg;base64,ZmFrZQ==";
  const mock = function () {
    this.readAsDataURL = vi.fn(function () {
      this.onload?.({ target: { result: fakeDataUrl } });
    });
    this.onload = null;
    this.result = fakeDataUrl;
  };
  window.FileReader = mock;
  return fakeDataUrl;
}

const sampleData = {
  proyecto: "Test Project",
  asignatura: "Test Asig",
  docente: "Test Docente",
  responsable: "Test Resp",
  celular: "3001234567",
  tiun: "12345",
  lugar: "Lab",
  "tipo-prestamo": "Interno",
  "fecha-retiro": "2026-05-18T10:00",
  "fecha-entrega": "2026-05-18T12:00",
  "mismo-dia": false,
  observaciones: "Test obs",
  equipos: [{ item: "1", nombre: "Camara", consecutivo: "C001" }],
  nombre: "Test Resp",
  "tipo-documento": "CC",
  "numero-documento": "123456789",
  contacto: "3001234567",
  "periodo-inicial": "2026-01-01",
  "periodo-final": "2026-06-30",
  "fecha-constancia": "2026-05-18",
  "firma-nombre": true,
};

describe("generateCombinedPDF", () => {
  beforeEach(() => {
    const jspdfDoc = createMockJsPDF();
    jspdfDoc.output = vi.fn(() => new Uint8Array([10, 20, 30]));
    createMockPDFLib();
    globalThis.html2canvas = vi.fn(() =>
      Promise.resolve({
        width: 1000,
        height: 1400,
        toDataURL: () => "data:image/png;base64,fake",
      }),
    );
    window.Image = function () {
      this.onload = null;
      this.width = 800;
      this.height = 600;
      const self = this;
      Object.defineProperty(this, "src", {
        set() {
          self.onload?.();
        },
      });
    };
  });

  afterEach(() => {
    delete window.jspdf;
    delete window.PDFLib;
    delete window.FileReader;
    delete window.Image;
    delete globalThis.html2canvas;
  });

  it("should return a Uint8Array with no carnet", async () => {
    const result = await generateCombinedPDF(sampleData, null);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("should return a Uint8Array with a PDF carnet", async () => {
    const carnet = mockPdfFile();
    const result = await generateCombinedPDF(sampleData, carnet);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("should return a Uint8Array with an image carnet", async () => {
    mockFileReader();
    const carnet = mockImageFile();
    const result = await generateCombinedPDF(sampleData, carnet);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it("should call PDFDocument.create for merged PDF", async () => {
    await generateCombinedPDF(sampleData, null);
    expect(window.PDFLib.PDFDocument.create).toHaveBeenCalledOnce();
  });

  it("should call PDFDocument.load for F1 and F2 PDFs", async () => {
    await generateCombinedPDF(sampleData, null);
    expect(window.PDFLib.PDFDocument.load).toHaveBeenCalledTimes(2);
  });

  it("should call PDFDocument.load three times with PDF carnet", async () => {
    const carnet = mockPdfFile();
    await generateCombinedPDF(sampleData, carnet);
    expect(window.PDFLib.PDFDocument.load).toHaveBeenCalledTimes(3);
  });

  it("should handle empty equipos array", async () => {
    const noEquipos = { ...sampleData, equipos: [] };
    const result = await generateCombinedPDF(noEquipos, null);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});
