import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getValue,
  setValue,
  getChecked,
  setChecked,
  getTableData,
  setFieldValues,
} from "../../../js/forms/common/dom.js";

describe("getValue", () => {
  beforeEach(() => {
    document.body.innerHTML = `<input id="test-input" value="hello"><div id="no-input"></div>`;
  });

  it("should return value of existing element", () => {
    expect(getValue("test-input")).toBe("hello");
  });

  it("should return empty string when element does not exist", () => {
    expect(getValue("nonexistent")).toBe("");
  });
});

describe("setValue", () => {
  beforeEach(() => {
    document.body.innerHTML = `<input id="test-input"><div id="no-input"></div>`;
  });

  it("should set value on existing element", () => {
    setValue("test-input", "world");
    expect(document.getElementById("test-input").value).toBe("world");
  });

  it("should do nothing when element does not exist", () => {
    expect(() => setValue("nonexistent", "val")).not.toThrow();
  });
});

describe("getChecked", () => {
  beforeEach(() => {
    document.body.innerHTML = `<input type="checkbox" id="checked-box" checked><input type="checkbox" id="unchecked-box"><div id="no-check"></div>`;
  });

  it("should return true for checked checkbox", () => {
    expect(getChecked("checked-box")).toBe(true);
  });

  it("should return false for unchecked checkbox", () => {
    expect(getChecked("unchecked-box")).toBe(false);
  });

  it("should return false when element does not exist", () => {
    expect(getChecked("nonexistent")).toBe(false);
  });
});

describe("setChecked", () => {
  beforeEach(() => {
    document.body.innerHTML = `<input type="checkbox" id="test-check"><div id="no-check"></div>`;
  });

  it("should check the checkbox", () => {
    setChecked("test-check", true);
    expect(document.getElementById("test-check").checked).toBe(true);
  });

  it("should uncheck the checkbox", () => {
    setChecked("test-check", false);
    expect(document.getElementById("test-check").checked).toBe(false);
  });

  it("should do nothing when element does not exist", () => {
    expect(() => setChecked("nonexistent", true)).not.toThrow();
  });
});

describe("getTableData", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table>
        <tbody id="test-tbody">
          <tr class="data-row">
            <td><input name="col-a" value="a1"></td>
            <td><input name="col-b" value="b1"></td>
          </tr>
          <tr class="data-row">
            <td><input name="col-a" value="a2"></td>
            <td><input name="col-b" value="b2"></td>
          </tr>
        </tbody>
      </table>
    `;
  });

  it("should return data from all rows", () => {
    const tbody = document.getElementById("test-tbody");
    const columns = [{ name: "col-a" }, { name: "col-b" }];
    const result = getTableData(tbody, columns);
    expect(result).toEqual([
      { "col-a": "a1", "col-b": "b1" },
      { "col-a": "a2", "col-b": "b2" },
    ]);
  });

  it("should return empty array when tbody is null", () => {
    expect(getTableData(null, [])).toEqual([]);
  });

  it("should return empty array when tbody is undefined", () => {
    expect(getTableData(undefined, [])).toEqual([]);
  });

  it("should handle missing input values", () => {
    document.body.innerHTML = `<table><tbody id="empty-tbody"><tr class="data-row"><td><input name="col-a"></td></tr></tbody></table>`;
    const tbody = document.getElementById("empty-tbody");
    const result = getTableData(tbody, [{ name: "col-a" }]);
    expect(result).toEqual([{ "col-a": "" }]);
  });

  it('should fall back to "tr" selector when rows have no class', () => {
    document.body.innerHTML = `
      <table>
        <tbody id="nocls-tbody">
          <tr>
            <td><input name="col-a" value="x"></td>
          </tr>
          <tr>
            <td><input name="col-a" value="y"></td>
          </tr>
        </tbody>
      </table>
    `;
    const tbody = document.getElementById("nocls-tbody");
    const result = getTableData(tbody, [{ name: "col-a" }]);
    expect(result).toEqual([{ "col-a": "x" }, { "col-a": "y" }]);
  });

  it("should use empty string when input element is missing for a column", () => {
    document.body.innerHTML = `
      <table>
        <tbody id="missing-tbody">
          <tr>
            <td>No input here</td>
          </tr>
        </tbody>
      </table>
    `;
    const tbody = document.getElementById("missing-tbody");
    const result = getTableData(tbody, [{ name: "col-a" }]);
    expect(result).toEqual([{ "col-a": "" }]);
  });
});

describe("setFieldValues", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="text-field">
      <input type="checkbox" id="check-field">
      <input id="text-field2">
    `;
  });

  it("should set text field values", () => {
    const fields = [{ id: "text-field" }, { id: "text-field2" }];
    setFieldValues(fields, { "text-field": "hello", "text-field2": "world" });
    expect(document.getElementById("text-field").value).toBe("hello");
    expect(document.getElementById("text-field2").value).toBe("world");
  });

  it("should set checkbox values", () => {
    const fields = [{ id: "check-field", type: "checkbox" }];
    setFieldValues(fields, { "check-field": true });
    expect(document.getElementById("check-field").checked).toBe(true);
  });

  it("should unset checkbox values", () => {
    document.getElementById("check-field").checked = true;
    const fields = [{ id: "check-field", type: "checkbox" }];
    setFieldValues(fields, { "check-field": false });
    expect(document.getElementById("check-field").checked).toBe(false);
  });

  it("should handle missing elements gracefully", () => {
    const fields = [
      { id: "nonexistent" },
      { id: "nonexistent-check", type: "checkbox" },
    ];
    expect(() => setFieldValues(fields, {})).not.toThrow();
  });
});
