import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F1_FORM_HTML } from "../../fixtures/f1-form-dom.js";

describe("F1 XLSX Generation", () => {
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

  describe("XLSX Generation", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should show alert when fetch fails for XLSX template", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo XLSX"),
          "error",
        );
      });
    });

    it("should show alert when XLSX template response is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      });
      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo XLSX"),
          "error",
        );
      });
    });

    it("should show alert when XLSX library is not loaded", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });
      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.EcytvUI.showSnackbar).toHaveBeenLastCalledWith(
          expect.stringContaining("Error al generar el archivo XLSX"),
          "error",
        );
      });
    });

    it("should generate XLSX when XLSX library and template are available", async () => {
      window.XLSX = {
        read: vi.fn().mockReturnValue({
          Sheets: { Sheet1: {} },
          SheetNames: ["Sheet1"],
        }),
        write: vi.fn().mockReturnValue(new ArrayBuffer(0)),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-xlsx").click();

      await vi.waitFor(() => {
        expect(window.XLSX.read).toHaveBeenCalled();
      });
      expect(window.EcytvUI.showSnackbar).not.toHaveBeenCalledWith(
        expect.stringContaining("Error al generar el archivo XLSX"),
      );
    });
  });

  describe("XLSX additional branch coverage", () => {
    beforeEach(() => {
      fillAllRequired();
    });

    it("should handle more than 14 equipment rows in XLSX", async () => {
      for (let i = 0; i < 15; i++) {
        document.getElementById("add-equip-btn").click();
        const rows = document.querySelectorAll(".equip-row");
        const lastRow = rows[rows.length - 1];
        lastRow.querySelector('input[name="equipo-nombre"]').value = `Equipo ${i}`;
        lastRow.querySelector('input[name="equipo-consecutivo"]').value = `CON-${i}`;
        lastRow.querySelector('input[name="equipo-item"]').value = `${i + 1}`;
      }

      window.XLSX = {
        read: vi.fn().mockReturnValue({
          Sheets: { Sheet1: {} },
          SheetNames: ["Sheet1"],
        }),
        write: vi.fn().mockReturnValue(new ArrayBuffer(0)),
      };
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      vi.spyOn(document.body, "appendChild").mockReturnValue(null);
      vi.spyOn(document.body, "removeChild").mockReturnValue(null);
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      document.getElementById("btn-xlsx").click();
      await vi.waitFor(() => {
        expect(window.XLSX.read).toHaveBeenCalled();
      });
    });
  });
});
