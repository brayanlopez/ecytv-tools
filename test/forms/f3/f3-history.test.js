import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F3_FORM_HTML } from "../../fixtures/f3-form-dom.js";

describe("F3 History", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F3_FORM_HTML;

    await import("../../../js/forms/f3/f3-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("asignatura").value = "Dirección de Arte";

      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorage.getItem("f3-history"));
      expect(stored).toHaveLength(1);
      expect(stored[0].data.proyecto).toBe("Proyecto Test");

      document.getElementById("proyecto").value = "";
      document.getElementById("autorizado").value = "";
      document.getElementById("asignatura").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("proyecto").value).toBe("Proyecto Test");
      expect(document.getElementById("autorizado").value).toBe("Autorizado Test");
      expect(document.getElementById("asignatura").value).toBe("Dirección de Arte");
    });

    it("should delete history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("btn-save").click();

      expect(JSON.parse(localStorage.getItem("f3-history"))).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorage.getItem("f3-history"))).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe("none");
    });

    it("should limit history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("proyecto").value = "Proyecto " + i;
        document.getElementById("autorizado").value = "Autorizado " + i;
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorage.getItem("f3-history"));
      expect(stored).toHaveLength(20);
    });
  });

  describe("getHistoryManager", () => {
    it("should return the history manager instance", async () => {
      const f3History = await import("../../../js/forms/f3/f3-history.js");
      const mgr = f3History.getHistoryManager();
      expect(mgr).toBeDefined();
      expect(typeof mgr.load).toBe("function");
      expect(typeof mgr.addEntry).toBe("function");
      expect(typeof mgr.removeEntry).toBe("function");
    });
  });

  describe("History restore edge cases", () => {
    it("should handle mismo-dia state during restore", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("fecha-retiro").value = "2026-01-01T10:00";
      document.getElementById("mismo-dia").checked = true;
      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      document.getElementById("fecha-retiro").value = "";

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("fecha-entrega").value).toBe("2026-01-01T10:00");
      expect(document.getElementById("fecha-entrega").disabled).toBe(true);
    });

    it("should restore multiple equipment rows from history", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("autorizado").value = "Autorizado Test";
      document.getElementById("add-equip-btn").click();
      const rows = document.querySelectorAll(".equip-row");
      rows[0].querySelector('input[name="equipo-tipo"]').value = "Iluminación";
      rows[0].querySelector('input[name="equipo-cantidad"]').value = "2";
      rows[0].querySelector('input[name="equipo-codigo"]').value = "COD-001";
      rows[0].querySelector('input[name="equipo-elemento"]').value = "Reflector";
      rows[1].querySelector('input[name="equipo-tipo"]').value = "Sonido";
      rows[1].querySelector('input[name="equipo-cantidad"]').value = "1";
      rows[1].querySelector('input[name="equipo-codigo"]').value = "COD-002";
      rows[1].querySelector('input[name="equipo-elemento"]').value = "Micrófono";

      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      document.getElementById("autorizado").value = "";

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      const restoredRows = document.querySelectorAll(".equip-row");
      expect(restoredRows).toHaveLength(2);
      expect(restoredRows[1].querySelector('input[name="equipo-tipo"]').value).toBe("Sonido");
    });

    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("autorizado").value = "Test";
      document.getElementById("btn-save").click();

      expect(() => {
        const restoreBtns = document.querySelectorAll(".btn-history-restore");
        if (restoreBtns.length > 0) {
          restoreBtns[0].dataset.id = "nonexistent";
          restoreBtns[0].click();
        }
      }).not.toThrow();
    });
  });
});
