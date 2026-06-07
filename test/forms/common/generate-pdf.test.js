import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockJsPDF } from "../../fixtures/mock-pdf.js";

vi.mock("../../../js/forms/common/html-to-pdf.js", () => ({
  htmlToPdf: vi.fn(),
}));

describe("generatePDF", () => {
  let htmlToPdfMock;
  let generatePDF;

  beforeEach(async () => {
    vi.resetModules();
    htmlToPdfMock = (await import("../../../js/forms/common/html-to-pdf.js")).htmlToPdf;
    htmlToPdfMock.mockClear();
    generatePDF = (await import("../../../js/forms/common/generate-pdf.js")).generatePDF;
  });

  it("calls htmlToPdf with the template output", async () => {
    const doc = createMockJsPDF();
    htmlToPdfMock.mockResolvedValue(doc);

    const buildTemplate = vi.fn(() => "<html><body>Test</body></html>");
    const getExportFilename = vi.fn(() => "f1_test_user_2026-01-01");

    await generatePDF(buildTemplate, getExportFilename, { foo: "bar" });

    expect(buildTemplate).toHaveBeenCalledWith({ foo: "bar" });
    expect(htmlToPdfMock).toHaveBeenCalledWith("<html><body>Test</body></html>");
    expect(getExportFilename).toHaveBeenCalledWith({ foo: "bar" });
    expect(doc.save).toHaveBeenCalledWith("f1_test_user_2026-01-01.pdf");
  });

  it("shows snackbar on error", async () => {
    const buildTemplate = vi.fn(() => {
      throw new Error("Template failed");
    });
    const getExportFilename = vi.fn();

    await generatePDF(buildTemplate, getExportFilename, {});

    expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
      "Error al generar el archivo PDF: Template failed",
      "error",
    );
  });

  it("shows snackbar when htmlToPdf rejects", async () => {
    htmlToPdfMock.mockRejectedValue(new Error("html2canvas error"));

    await generatePDF(
      vi.fn(() => "<html/>"),
      vi.fn(() => "test"),
      {},
    );

    expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
      "Error al generar el archivo PDF: html2canvas error",
      "error",
    );
  });

  it("shows snackbar when getExportFilename throws", async () => {
    const doc = createMockJsPDF();
    htmlToPdfMock.mockResolvedValue(doc);

    await generatePDF(
      vi.fn(() => "<html/>"),
      vi.fn(() => {
        throw new Error("Bad filename");
      }),
      {},
    );

    expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
      "Error al generar el archivo PDF: Bad filename",
      "error",
    );
  });
});
