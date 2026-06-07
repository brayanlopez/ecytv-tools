import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

function createMockPDFLib() {
  const srcPage = {};
  const mergedPage = {};
  const srcDoc = {
    getPageCount: vi.fn(() => 3),
    getPageIndices: vi.fn(() => [0, 1, 2]),
    copyPages: vi.fn(() => Promise.resolve([mergedPage, mergedPage, mergedPage])),
  };
  const mergedDoc = {
    addPage: vi.fn(),
    save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    copyPages: vi.fn(() => Promise.resolve([mergedPage])),
  };

  window.PDFLib = {
    PDFDocument: {
      create: vi.fn(() => Promise.resolve(mergedDoc)),
      load: vi.fn(() => Promise.resolve(srcDoc)),
    },
  };

  return { srcDoc, mergedDoc, srcPage, mergedPage };
}

function getDOM() {
  return `
    <nav>
      <div class="container">
        <a href="#formats" class="logo" id="back-link">← Volver a Formatos</a>
      </div>
    </nav>
    <main id="main-content" class="merge-page">
      <h1>Fusionar PDFs</h1>
      <div class="merge-card">
        <h2>Seleccionar archivos</h2>
        <div id="drop-zone" class="drop-zone" role="button" tabindex="0">
          <input type="file" id="file-input" accept=".pdf,application/pdf" multiple style="display:none" />
        </div>
      </div>
      <div class="merge-card">
        <h2>Archivos seleccionados</h2>
        <div id="file-list" class="merge-file-list">
          <p id="file-list-empty" class="merge-file-list-empty">Aún no has seleccionado ningún archivo PDF.</p>
        </div>
        <div class="merge-actions">
          <button type="button" id="btn-merge" class="merge-btn" disabled>Fusionar PDFs</button>
        </div>
      </div>
      <div id="download-section" class="download-section" style="display:none">
        <h3>¡Fusión completada!</h3>
        <p class="merge-result-info"></p>
        <a id="btn-download-merged" class="btn-download" download>Descargar PDF fusionado</a>
      </div>
    </main>
  `;
}

describe("PDF Merge", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = getDOM();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    delete window.PDFLib;
  });

  describe("Initialization", () => {
    it("should show error snackbar when PDFLib is not loaded", async () => {
      window.PDFLib = undefined;

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        expect.stringContaining("Error al cargar la librería PDF"),
        "error",
      );
    });

    it("should disable merge button when PDFLib is not loaded", async () => {
      window.PDFLib = undefined;

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      const mergeBtn = document.getElementById("btn-merge");
      expect(mergeBtn.disabled).toBe(true);
    });

    it("should enable merge button when PDFLib is loaded", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      const mergeBtn = document.getElementById("btn-merge");
      expect(mergeBtn.disabled).toBe(true);
    });
  });

  describe("Back link", () => {
    it("should navigate to ./#formats on click", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      const backLink = document.getElementById("back-link");
      const event = new Event("click");
      vi.spyOn(event, "preventDefault");
      backLink.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe("File management", () => {
    it("should add valid PDF files and render them in the list", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        const items = document.querySelectorAll(".merge-file-item");
        expect(items.length).toBe(1);
        expect(items[0].textContent).toContain("test.pdf");
      });
    });

    it("should reject non-PDF files with warning", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const file = new File(["dummy"], "test.txt", { type: "text/plain" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        expect.stringContaining("no es un archivo PDF"),
        "warning",
      );

      const items = document.querySelectorAll(".merge-file-item");
      expect(items.length).toBe(0);
    });

    it("should remove a file when remove button is clicked", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(1);
      });

      const removeBtn = document.querySelector(".merge-file-remove");
      removeBtn.click();

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(0);
      });

      const emptyMsg = document.getElementById("file-list-empty");
      expect(emptyMsg.style.display).toBe("block");
    });

    it("should reorder files on drag and drop", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const fileA = new File(["a"], "a.pdf", { type: "application/pdf" });
      const fileB = new File(["b"], "b.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [fileA, fileB],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(2);
      });

      const items = document.querySelectorAll(".merge-file-item");
      const names = Array.from(items).map((el) => el.textContent);
      expect(names[0]).toContain("a.pdf");
      expect(names[1]).toContain("b.pdf");

      const dragEvent = new Event("dragstart");
      dragEvent.dataTransfer = { setData: vi.fn(), effectAllowed: "" };
      items[1].dispatchEvent(dragEvent);

      const dropEvent = new Event("drop");
      dropEvent.dataTransfer = { getData: vi.fn(() => "1"), effectAllowed: "" };
      dropEvent.preventDefault = vi.fn();
      items[0].dispatchEvent(dropEvent);

      const reorderItems = document.querySelectorAll(".merge-file-item");
      expect(reorderItems.length).toBe(2);

      items.forEach((el) => {
        const dragOver = new Event("dragover");
        dragOver.dataTransfer = { dropEffect: "" };
        dragOver.preventDefault = vi.fn();
        el.dispatchEvent(dragOver);
      });
    });
  });

  describe("Merge button state", () => {
    it("should be disabled with fewer than 2 files", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const mergeBtn = document.getElementById("btn-merge");
      expect(mergeBtn.disabled).toBe(true);

      const fileInput = document.getElementById("file-input");
      const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(1);
      });
      expect(mergeBtn.disabled).toBe(true);
    });

    it("should become enabled with 2 or more files", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const mergeBtn = document.getElementById("btn-merge");
      const fileInput = document.getElementById("file-input");

      const fileA = new File(["a"], "a.pdf", { type: "application/pdf" });
      const fileB = new File(["b"], "b.pdf", { type: "application/pdf" });

      Object.defineProperty(fileInput, "files", {
        value: [fileA, fileB],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(2);
      });
      expect(mergeBtn.disabled).toBe(false);
    });
  });

  describe("PDF merge flow", () => {
    it("should merge files and show download section on success", async () => {
      createMockPDFLib();

      vi.spyOn(document.body, "appendChild");

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const fileA = new File(["a"], "a.pdf", { type: "application/pdf" });
      const fileB = new File(["b"], "b.pdf", { type: "application/pdf" });

      Object.defineProperty(fileInput, "files", {
        value: [fileA, fileB],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(2);
      });

      const mergeBtn = document.getElementById("btn-merge");
      mergeBtn.click();

      await vi.waitFor(() => {
        const downloadSection = document.getElementById("download-section");
        expect(downloadSection.style.display).toBe("block");
      });

      const downloadBtn = document.getElementById("btn-download-merged");
      expect(downloadBtn.href).toBeTruthy();
      expect(downloadBtn.download).toContain(".pdf");

      expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
        expect.stringContaining("fusionados"),
        "success",
      );
    });

    it("should show error snackbar on merge failure", async () => {
      createMockPDFLib();
      window.PDFLib.PDFDocument.create.mockRejectedValue(new Error("Test error"));

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const fileA = new File(["a"], "a.pdf", { type: "application/pdf" });
      const fileB = new File(["b"], "b.pdf", { type: "application/pdf" });

      Object.defineProperty(fileInput, "files", {
        value: [fileA, fileB],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(2);
      });

      const mergeBtn = document.getElementById("btn-merge");
      mergeBtn.click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
          expect.stringContaining("Error"),
          "error",
        );
      });

      expect(mergeBtn.disabled).toBe(false);
      expect(mergeBtn.textContent).toContain("Fusionar");
    });
  });

  describe("Drop zone interactions", () => {
    it("should open file selector on click", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const clickSpy = vi.spyOn(fileInput, "click");
      const dropZone = document.getElementById("drop-zone");
      dropZone.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it("should add class on dragover and remove on dragleave", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const dropZone = document.getElementById("drop-zone");
      dropZone.dispatchEvent(new Event("dragover"));
      expect(dropZone.classList.contains("drag-over")).toBe(true);

      dropZone.dispatchEvent(new Event("dragleave"));
      expect(dropZone.classList.contains("drag-over")).toBe(false);
    });

    it("should add files on drop event", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const dropZone = document.getElementById("drop-zone");
      const file = new File(["dummy"], "dropped.pdf", { type: "application/pdf" });

      const dropEvent = new Event("drop");
      dropEvent.dataTransfer = { files: [file] };
      dropEvent.preventDefault = vi.fn();
      dropZone.dispatchEvent(dropEvent);

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(1);
      });
      expect(dropZone.classList.contains("drag-over")).toBe(false);
    });

    it("should show warning for non-PDF files added via drop", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const dropZone = document.getElementById("drop-zone");
      const file = new File(["dummy"], "image.png", { type: "image/png" });

      const dropEvent = new Event("drop");
      dropEvent.dataTransfer = { files: [file] };
      dropEvent.preventDefault = vi.fn();
      dropZone.dispatchEvent(dropEvent);

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenCalledWith(
          expect.stringContaining("no es un archivo PDF"),
          "warning",
        );
      });
      expect(document.querySelectorAll(".merge-file-item").length).toBe(0);
    });

    it("should accept PDF via .pdf extension when type is generic", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const file = new File(["dummy"], "doc.pdf", { type: "application/octet-stream" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(1);
      });
    });

    it("should handle same-index drag and drop (no reorder)", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const fileA = new File(["a"], "a.pdf", { type: "application/pdf" });
      const fileB = new File(["b"], "b.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [fileA, fileB],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        expect(document.querySelectorAll(".merge-file-item").length).toBe(2);
      });

      const items = document.querySelectorAll(".merge-file-item");

      const dragEvent = new Event("dragstart");
      dragEvent.dataTransfer = { setData: vi.fn(), effectAllowed: "" };
      items[0].dispatchEvent(dragEvent);

      const dropEvent = new Event("drop");
      dropEvent.dataTransfer = { getData: vi.fn(() => "0"), effectAllowed: "" };
      dropEvent.preventDefault = vi.fn();
      items[0].dispatchEvent(dropEvent);

      const reorderItems = document.querySelectorAll(".merge-file-item");
      expect(reorderItems.length).toBe(2);
    });

    it("should indicate page count when available", async () => {
      const pdfLib = createMockPDFLib();
      pdfLib.srcDoc.getPageCount.mockReturnValue(5);

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const file = new File(["a"], "a.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        const items = document.querySelectorAll(".merge-file-item");
        expect(items[0].textContent).toContain("5 pág.");
      });
    });

    it("should handle getPageCount failure gracefully", async () => {
      const pdfLib = createMockPDFLib();
      pdfLib.srcDoc.getPageCount.mockImplementation(() => {
        throw new Error("bad");
      });

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const fileInput = document.getElementById("file-input");
      const file = new File(["a"], "a.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event("change"));

      await vi.waitFor(() => {
        const items = document.querySelectorAll(".merge-file-item");
        expect(items.length).toBe(1);
      });
    });

    it("should return early from handleMerge when files less than 2", async () => {
      createMockPDFLib();

      await import("../../../js/forms/pdf-merge/pdf-merge.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const mergeBtn = document.getElementById("btn-merge");
      mergeBtn.click();

      expect(window.PDFLib.PDFDocument.create).not.toHaveBeenCalled();
    });
  });
});
