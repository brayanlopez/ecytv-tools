import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F1_FORM_HTML } from "../../fixtures/f1-form-dom.js";

describe("F1 History", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F1_FORM_HTML;

    await import("../../../js/forms/f1/f1-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("asignatura").value = "Sonido I";

      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorage.getItem("f1-history"));
      expect(stored).toHaveLength(1);
      expect(stored[0].data.proyecto).toBe("Proyecto Test");

      document.getElementById("proyecto").value = "";
      document.getElementById("responsable").value = "";
      document.getElementById("asignatura").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("proyecto").value).toBe("Proyecto Test");
      expect(document.getElementById("responsable").value).toBe("Responsable Test");
      expect(document.getElementById("asignatura").value).toBe("Sonido I");
    });

    it("should delete history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("responsable").value = "Responsable Test";
      document.getElementById("btn-save").click();

      expect(JSON.parse(localStorage.getItem("f1-history"))).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorage.getItem("f1-history"))).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe("none");
    });

    it("should limit history to 20 entries", { timeout: 15000 }, () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("proyecto").value = "Proyecto " + i;
        document.getElementById("responsable").value = "Responsable " + i;
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorage.getItem("f1-history"));
      expect(stored).toHaveLength(20);
    });
  });

  describe("History restore edge cases", () => {
    it("should handle mismo-dia state during restore", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("responsable").value = "Responsable Test";
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

    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("responsable").value = "Test";
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
