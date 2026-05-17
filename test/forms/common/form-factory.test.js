import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createFormFactory } from "../../../js/forms/common/form-factory.js";

describe("createFormFactory", () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => localStorageMock[key] ?? null,
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
      delete localStorageMock[key];
    });
    window.EcytvUI = { showSnackbar: vi.fn(), showModal: vi.fn() };
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("renderHistory without getSubtitle", () => {
    it("should render history entries when getSubtitle is absent", () => {
      const factory = createFormFactory({
        formId: "test-form",
        fields: [{ id: "name" }],
        historyConfig: {
          key: "test-no-sub",
          getTitle: (d) => d.name,
          isValid: (d) => !!d.name,
          warnMsg: "warn",
          successMsg: "success",
        },
        exportFilename: "test",
      });

      document.body.innerHTML = `
        <form id="test-form">
          <input id="name" value="Test">
        </form>
        <div id="history-list"></div>
        <div id="history-card"></div>
      `;

      const saved = factory.saveFormToHistory(() => ({ name: "Test" }), null);
      expect(saved).toBe(true);

      const listEl = document.getElementById("history-list");
      expect(listEl.innerHTML).toContain("Test");
      expect(listEl.innerHTML).not.toContain("·");
      expect(listEl.innerHTML).not.toContain("undefined");
    });
  });

  describe("handleGenerateODS and handleGenerateXLSX", () => {
    it("should call ods generator when btn-ods is clicked", () => {
      const mockODS = vi.fn();
      const factory = createFormFactory({
        formId: "test-form",
        fields: [{ id: "name" }],
        historyConfig: {
          key: "test-ods",
          getTitle: (d) => d.name,
          getSubtitle: () => "",
          isValid: () => true,
          warnMsg: "warn",
          successMsg: "success",
        },
        generators: { ods: mockODS },
        exportFilename: "test",
      });

      document.body.innerHTML = `
        <form id="test-form">
          <input id="name" value="Test">
          <button type="button" id="btn-ods">ODS</button>
        </form>
        <div id="history-list"></div>
        <div id="history-card"></div>
      `;

      factory.init();
      document.getElementById("btn-ods").click();

      expect(mockODS).toHaveBeenCalled();
      expect(mockODS).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test" }),
      );
    });

    it("should call xlsx generator when btn-xlsx is clicked", () => {
      const mockXLSX = vi.fn();
      const factory = createFormFactory({
        formId: "test-form",
        fields: [{ id: "name" }],
        historyConfig: {
          key: "test-xlsx",
          getTitle: (d) => d.name,
          getSubtitle: () => "",
          isValid: () => true,
          warnMsg: "warn",
          successMsg: "success",
        },
        generators: { xlsx: mockXLSX },
        exportFilename: "test",
      });

      document.body.innerHTML = `
        <form id="test-form">
          <input id="name" value="Test">
          <button type="button" id="btn-xlsx">XLSX</button>
        </form>
        <div id="history-list"></div>
        <div id="history-card"></div>
      `;

      factory.init();
      document.getElementById("btn-xlsx").click();

      expect(mockXLSX).toHaveBeenCalled();
      expect(mockXLSX).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test" }),
      );
    });
  });
});
