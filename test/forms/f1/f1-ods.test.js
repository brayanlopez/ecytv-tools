import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F1_FORM_HTML } from "../../fixtures/f1-form-dom.js";

describe("F1 ODS Generation", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F1_FORM_HTML;

    await import("../../../js/forms/f1/f1-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fillAllRequired() {
    document.getElementById("proyecto").value = "Proyecto Test";
    document.getElementById("asignatura").value = "Sonido I";
    document.getElementById("docente").value = "Docente Test";
    document.getElementById("responsable").value = "Responsable Test";
    document.getElementById("celular").value = "1234567890";
    document.getElementById("tipo-documento").value = "CC";
    document.getElementById("numero-documento").value = "123456789";
    document.getElementById("tiun").value = "TIUN123";
    document.getElementById("lugar").value = "Estudio";
    document.getElementById("tipo-prestamo").value = "Interno";
    document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
    document.getElementById("fecha-entrega").value = "2026-01-01T12:00";
    document.querySelector('input[name="equipo-nombre"]').value = "Cámara";
    document.querySelector('input[name="equipo-consecutivo"]').value = "CON-001";
  }

  describe("ODS Generation", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should show alert when fetch fails for ODS template", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
          "error",
        );
      });
    });

    it("should show alert when ODS template response is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      });
      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
          "error",
        );
      });
    });

    it("should show alert when JSZip is not loaded", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });
      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo ODS"),
          "error",
        );
      });
    });

    it("should generate ODS when JSZip and template are available", async () => {
      const cell = "<table:table-cell><text:p>x</text:p></table:table-cell>";
      const tableRows = Array.from(
        { length: 40 },
        () => `<table:table-row>${cell}${cell}${cell}${cell}${cell}</table:table-row>`,
      ).join("");

      window.JSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue({
            async: vi.fn().mockResolvedValue(
              `<?xml version="1.0"?>
              <office:document
                xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
                <office:body>
                  <office:spreadsheet>
                    <table:table>${tableRows}</table:table>
                  </office:spreadsheet>
                </office:body>
              </office:document>`,
            ),
          }),
          generateAsync: vi.fn().mockResolvedValue(new Blob()),
        }),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-ods").click();

      await vi.waitFor(() => {
        expect(window.JSZip.loadAsync).toHaveBeenCalled();
      });
      expect(window.EcytvUI.showSnackbar).not.toHaveBeenCalledWith(
        expect.stringContaining("Error al generar el archivo ODS"),
      );
    });
  });

  describe("ODS additional branch coverage", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should handle 'Externo' loan type in ODS", async () => {
      document.getElementById("tipo-prestamo").value = "Externo";
      const cell = "<table:table-cell><text:p>x</text:p></table:table-cell>";
      const tableRows = Array.from(
        { length: 40 },
        () => `<table:table-row>${cell}${cell}${cell}${cell}${cell}</table:table-row>`,
      ).join("");

      window.JSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue({
            async: vi.fn().mockResolvedValue(
              `<?xml version="1.0"?>
              <office:document
                xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
                <office:body>
                  <office:spreadsheet>
                    <table:table>${tableRows}</table:table>
                  </office:spreadsheet>
                </office:body>
              </office:document>`,
            ),
          }),
          generateAsync: vi.fn().mockResolvedValue(new Blob()),
        }),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-ods").click();
      await vi.waitFor(() => {
        expect(window.JSZip.loadAsync).toHaveBeenCalled();
      });
    });

    it("should handle more than 14 equipment rows in ODS", async () => {
      for (let i = 0; i < 15; i++) {
        document.getElementById("add-equip-btn").click();
        const rows = document.querySelectorAll(".equip-row");
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('input[name="equipo-nombre"]').value = `Equipo ${i}`;
        lastRow.querySelector('input[name="equipo-consecutivo"]').value = `CON-${i}`;
        lastRow.querySelector('input[name="equipo-item"]').value = `${i + 1}`;
      }

      const cell = "<table:table-cell><text:p>x</text:p></table:table-cell>";
      const tableRows = Array.from(
        { length: 40 },
        () => `<table:table-row>${cell}${cell}${cell}${cell}${cell}</table:table-row>`,
      ).join("");

      window.JSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue({
            async: vi.fn().mockResolvedValue(
              `<?xml version="1.0"?>
              <office:document
                xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
                <office:body>
                  <office:spreadsheet>
                    <table:table>${tableRows}</table:table>
                  </office:spreadsheet>
                </office:body>
              </office:document>`,
            ),
          }),
          generateAsync: vi.fn().mockResolvedValue(new Blob()),
        }),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-ods").click();
      await vi.waitFor(() => {
        expect(window.JSZip.loadAsync).toHaveBeenCalled();
      });
    });
  });
});
