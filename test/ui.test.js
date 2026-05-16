import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("UI Components", () => {
  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = "";
    vi.stubGlobal("requestAnimationFrame", (cb) => cb());
    await import("../js/ui.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("showSnackbar", () => {
    it("should create a snackbar container if not present", () => {
      expect(document.querySelector(".snackbar-container")).toBeNull();
      window.EcytvUI.showSnackbar("Test message", "info", 0);
      expect(document.querySelector(".snackbar-container")).toBeTruthy();
    });

    it("should append a snackbar element", () => {
      window.EcytvUI.showSnackbar("Test message", "info", 0);
      const snackbar = document.querySelector(".snackbar");
      expect(snackbar).toBeTruthy();
      expect(snackbar.querySelector(".snackbar-message").textContent).toBe(
        "Test message",
      );
    });

    it("should add the correct type class", () => {
      window.EcytvUI.showSnackbar("Success", "success", 0);
      expect(document.querySelector(".snackbar.snackbar-success")).toBeTruthy();

      window.EcytvUI.showSnackbar("Error", "error", 0);
      expect(document.querySelector(".snackbar.snackbar-error")).toBeTruthy();

      window.EcytvUI.showSnackbar("Warning", "warning", 0);
      expect(document.querySelector(".snackbar.snackbar-warning")).toBeTruthy();

      window.EcytvUI.showSnackbar("Info", "info", 0);
      expect(document.querySelector(".snackbar.snackbar-info")).toBeTruthy();
    });

    it("should add show class for animation", () => {
      window.EcytvUI.showSnackbar("Test", "info", 0);
      const el = document.querySelector(".snackbar");
      expect(el.classList.contains("show")).toBe(true);
    });

    it("should close when close button is clicked", () => {
      window.EcytvUI.showSnackbar("Test", "info", 0);
      const el = document.querySelector(".snackbar");
      el.querySelector(".snackbar-close").click();
      expect(el.classList.contains("show")).toBe(false);
    });

    it("should stack multiple snackbars", () => {
      window.EcytvUI.showSnackbar("First", "info", 0);
      window.EcytvUI.showSnackbar("Second", "success", 0);
      const items = document.querySelectorAll(".snackbar");
      expect(items.length).toBe(2);
    });

    it("should auto-dismiss after duration and remove on transitionend", () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      window.EcytvUI.showSnackbar("Auto dismiss", "info", 1000);
      const el = document.querySelector(".snackbar");
      expect(el.classList.contains("show")).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(el.classList.contains("show")).toBe(false);

      el.dispatchEvent(new Event("transitionend"));
      expect(document.querySelector(".snackbar")).toBeNull();
      vi.useRealTimers();
    });

    it("should not auto-dismiss when duration is 0", () => {
      vi.useFakeTimers();
      window.EcytvUI.showSnackbar("No dismiss", "info", 0);
      const el = document.querySelector(".snackbar");

      vi.advanceTimersByTime(10000);
      expect(el.classList.contains("show")).toBe(true);
      vi.useRealTimers();
    });

    it("should return the snackbar element", () => {
      const result = window.EcytvUI.showSnackbar("Test", "info", 0);
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.classList.contains("snackbar")).toBe(true);
    });
  });

  describe("showModal", () => {
    it("should create a modal overlay if not present", () => {
      expect(document.querySelector(".modal-overlay")).toBeNull();
      window.EcytvUI.showModal({ title: "Test", message: "Test message" });
      expect(document.querySelector(".modal-overlay")).toBeTruthy();
    });

    it("should show the modal with correct title and message", () => {
      window.EcytvUI.showModal({
        title: "Confirmar acción",
        message: "¿Estás seguro?",
      });
      const overlay = document.querySelector(".modal-overlay");
      expect(overlay.classList.contains("show")).toBe(true);
      expect(overlay.querySelector(".modal-title").textContent).toBe(
        "Confirmar acción",
      );
      expect(overlay.querySelector(".modal-message").textContent).toBe(
        "¿Estás seguro?",
      );
    });

    it("should have confirm and cancel buttons by default", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const footer = document.querySelector(".modal-footer");
      const buttons = footer.querySelectorAll("button");
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe("Cancelar");
      expect(buttons[0].classList.contains("btn-secondary")).toBe(true);
      expect(buttons[1].textContent).toBe("Aceptar");
      expect(buttons[1].classList.contains("btn-primary")).toBe(true);
    });

    it("should use custom button text", () => {
      window.EcytvUI.showModal({
        title: "Test",
        message: "Test",
        confirmText: "Sí",
        cancelText: "No",
      });
      const buttons = document.querySelectorAll(".modal-footer button");
      expect(buttons[0].textContent).toBe("No");
      expect(buttons[1].textContent).toBe("Sí");
    });

    it("should close when close button is clicked", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const overlay = document.querySelector(".modal-overlay");
      overlay.querySelector(".modal-close").click();
      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should close when overlay is clicked", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const overlay = document.querySelector(".modal-overlay");
      overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should close on Escape key", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const overlay = document.querySelector(".modal-overlay");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(overlay.classList.contains("show")).toBe(false);
    });

    it("should call onConfirm when confirm is clicked", () => {
      const onConfirm = vi.fn();
      window.EcytvUI.showModal({
        title: "Test",
        message: "Test",
        onConfirm,
      });
      document.querySelector(".modal-footer .btn-primary").click();
      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("should call onCancel when cancel is clicked", () => {
      const onCancel = vi.fn();
      window.EcytvUI.showModal({
        title: "Test",
        message: "Test",
        onCancel,
      });
      document.querySelector(".modal-footer .btn-secondary").click();
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it("should return a promise that resolves on confirm", async () => {
      const promise = window.EcytvUI.showModal({
        title: "Test",
        message: "Test",
      });
      document.querySelector(".modal-footer .btn-primary").click();
      const result = await promise;
      expect(result).toBe(true);
    });

    it("should return a promise that resolves on cancel", async () => {
      const promise = window.EcytvUI.showModal({
        title: "Test",
        message: "Test",
      });
      document.querySelector(".modal-footer .btn-secondary").click();
      const result = await promise;
      expect(result).toBe(false);
    });

    it("should close with closeModal", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      window.EcytvUI.closeModal(null);
      expect(
        document.querySelector(".modal-overlay").classList.contains("show"),
      ).toBe(false);
    });

    it("should trap Tab key and wrap to last element when Shift+Tab from first", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const modal = document.querySelector(".modal-overlay").querySelector(".modal");
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusSpy = vi.spyOn(focusable[focusable.length - 1], "focus");

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true }));
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should wrap Tab to first element when Tab from last", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const modal = document.querySelector(".modal-overlay").querySelector(".modal");
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusSpy = vi.spyOn(focusable[0], "focus");

      const restoreActiveElement = vi.spyOn(document, "activeElement", "get").mockReturnValue(focusable[focusable.length - 1]);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should not throw when Tab is pressed and no focusable elements exist", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const modal = document.querySelector(".modal-overlay").querySelector(".modal");

      modal.querySelectorAll("button").forEach((btn) => btn.remove());

      expect(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      }).not.toThrow();
    });

    it("should ignore non-Tab and non-Escape keys in modal", () => {
      window.EcytvUI.showModal({ title: "Test", message: "Test" });
      const overlay = document.querySelector(".modal-overlay");

      overlay.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      expect(overlay.classList.contains("show")).toBe(true);
    });
  });
});
