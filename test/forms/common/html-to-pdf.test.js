import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { htmlToPdf } from "../../../js/forms/common/html-to-pdf.js";

function mockCanvas(width, height) {
  return {
    width,
    height,
    toDataURL: () => "data:image/png;base64,fake",
  };
}

function setupMocks() {
  const doc = {
    addImage: vi.fn(() => doc),
    output: vi.fn(() => new Uint8Array([1, 2, 3])),
  };
  window.jspdf = {
    jsPDF: vi.fn(function () {
      return doc;
    }),
  };
  globalThis.html2canvas = vi.fn(() => Promise.resolve(mockCanvas(1000, 200)));
  return doc;
}

describe("htmlToPdf", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    delete window.jspdf;
    delete globalThis.html2canvas;
    vi.restoreAllMocks();
  });

  it("should throw when jsPDF is not available", async () => {
    await expect(htmlToPdf("<p>test</p>")).rejects.toThrow("La librería jsPDF no está disponible.");
  });

  it("should throw when jsPDF.jsPDF is not available", async () => {
    window.jspdf = {};
    await expect(htmlToPdf("<p>test</p>")).rejects.toThrow("La librería jsPDF no está disponible.");
  });

  it("should throw when html2canvas is not available", async () => {
    window.jspdf = { jsPDF: vi.fn() };
    await expect(htmlToPdf("<p>test</p>")).rejects.toThrow(
      "La librería html2canvas no está disponible.",
    );
  });

  it("should handle content that fits on one page", async () => {
    const doc = setupMocks();
    const result = await htmlToPdf("<p>Short content</p>");
    expect(result).toBe(doc);
    expect(doc.addImage).toHaveBeenCalledOnce();
  });

  it("should handle content taller than one page (needs scaling)", async () => {
    const doc = setupMocks();
    globalThis.html2canvas = vi.fn(() => Promise.resolve(mockCanvas(1000, 3000)));
    const result = await htmlToPdf("<p>Tall content</p>");
    expect(result).toBe(doc);
    expect(doc.addImage).toHaveBeenCalledOnce();
  });

  it("should add content to document body and remove it", async () => {
    setupMocks();
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");
    await htmlToPdf("<p>Test</p>");
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });
});
