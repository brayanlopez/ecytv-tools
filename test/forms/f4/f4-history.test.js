import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { F4_FORM_HTML } from "../../fixtures/f4-form-dom.js";

describe("F4 History", () => {
  beforeEach(async () => {
    vi.resetModules();

    document.body.innerHTML = F4_FORM_HTML;

    await import("../../../js/forms/f4/f4-form.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("History", () => {
    it("should save and restore history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("asignatura").value = "Dirección de Arte";

      document.getElementById("btn-save").click();

      const stored = JSON.parse(localStorage.getItem("f4-history"));
      expect(stored).toHaveLength(1);
      expect(stored[0].data.proyecto).toBe("Proyecto Test");

      document.getElementById("proyecto").value = "";
      document.getElementById("directo-responsable").value = "";
      document.getElementById("asignatura").value = "";

      const historyCard = document.getElementById("history-card");
      expect(historyCard.style.display).not.toBe("none");

      const restoreBtns = historyCard.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.getElementById("proyecto").value).toBe("Proyecto Test");
      expect(document.getElementById("directo-responsable").value).toBe("Responsable Test");
      expect(document.getElementById("asignatura").value).toBe("Dirección de Arte");
    });

    it("should delete history entries", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("btn-save").click();

      expect(JSON.parse(localStorage.getItem("f4-history"))).toHaveLength(1);

      const deleteBtns = document.querySelectorAll(".btn-history-delete");
      deleteBtns[0].click();

      expect(JSON.parse(localStorage.getItem("f4-history"))).toHaveLength(0);
      expect(document.getElementById("history-card").style.display).toBe("none");
    });

    it("should return history manager via getHistoryManager", async () => {
      const { getHistoryManager } = await import("../../../js/forms/f4/f4-history.js");
      const mgr = getHistoryManager();
      expect(mgr).toBeDefined();
      expect(typeof mgr.addEntry).toBe("function");
    });

    it("should limit history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        document.getElementById("proyecto").value = "Proyecto " + i;
        document.getElementById("directo-responsable").value = "Responsable " + i;
        document.getElementById("btn-save").click();
      }

      const stored = JSON.parse(localStorage.getItem("f4-history"));
      expect(stored).toHaveLength(20);
    });
  });

  describe("History restore edge cases", () => {
    it("should restore sala rows from history", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
      document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
      document.querySelector('input[name="sala-hora-fin"]').value = "10:00";
      document.getElementById("add-sala-btn").click();
      const rows = document.querySelectorAll(".sala-row");
      rows[1].querySelector('input[name="sala-nombre"]').value = "Sala NL2";
      rows[1].querySelector('input[name="sala-fecha"]').value = "2026-06-02";
      rows[1].querySelector('input[name="sala-hora-inicio"]').value = "14:00";
      rows[1].querySelector('input[name="sala-hora-fin"]').value = "16:00";

      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      document.querySelector('input[name="sala-nombre"]').value = "";

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(document.querySelector('input[name="sala-nombre"]').value).toBe("Sala NL1");
      const restoredRows = document.querySelectorAll(".sala-row");
      expect(restoredRows).toHaveLength(2);
    });

    it("should do nothing when restoring non-existent id", () => {
      document.getElementById("proyecto").value = "Test";
      document.getElementById("directo-responsable").value = "Test";
      document.getElementById("btn-save").click();

      expect(() => {
        const restoreBtns = document.querySelectorAll(".btn-history-restore");
        if (restoreBtns.length > 0) {
          restoreBtns[0].dataset.id = "nonexistent";
          restoreBtns[0].click();
        }
      }).not.toThrow();
    });

    it("should clean extra rows before restoring from history", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.getElementById("btn-save").click();

      const tbody = document.getElementById("sala-tbody");
      const extraRow = document.createElement("tr");
      extraRow.className = "sala-row";
      extraRow.innerHTML =
        '<td><input name="sala-nombre" value="Dirty" /></td><td></td><td></td><td></td><td></td>';
      tbody.appendChild(extraRow);
      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(2);

      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(1);
    });

    it("should remove dynamically restored sala rows via their own button", () => {
      document.getElementById("proyecto").value = "Proyecto Test";
      document.getElementById("directo-responsable").value = "Responsable Test";
      document.querySelector('input[name="sala-nombre"]').value = "Sala NL1";
      document.querySelector('input[name="sala-fecha"]').value = "2026-06-01";
      document.querySelector('input[name="sala-hora-inicio"]').value = "08:00";
      document.querySelector('input[name="sala-hora-fin"]').value = "10:00";
      document.getElementById("add-sala-btn").click();
      const rows = document.querySelectorAll(".sala-row");
      rows[1].querySelector('input[name="sala-nombre"]').value = "Sala NL2";
      rows[1].querySelector('input[name="sala-fecha"]').value = "2026-06-02";
      rows[1].querySelector('input[name="sala-hora-inicio"]').value = "14:00";
      rows[1].querySelector('input[name="sala-hora-fin"]').value = "16:00";
      document.getElementById("btn-save").click();

      document.getElementById("proyecto").value = "";
      const restoreBtns = document.querySelectorAll(".btn-history-restore");
      restoreBtns[0].click();

      const tbody = document.getElementById("sala-tbody");
      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(2);
      const removeBtns = tbody.querySelectorAll(".btn-remove-equip");
      removeBtns[1].click();
      expect(tbody.querySelectorAll(".sala-row")).toHaveLength(1);
    });
  });
});
