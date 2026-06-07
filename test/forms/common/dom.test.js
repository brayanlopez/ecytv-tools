import { describe, it, expect, beforeEach } from "vitest";
import {
  getValue,
  setValue,
  getChecked,
  setChecked,
  getTableData,
  setFieldValues,
  createTableRow,
  initTable,
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
    const fields = [{ id: "nonexistent" }, { id: "nonexistent-check", type: "checkbox" }];
    expect(() => setFieldValues(fields, {})).not.toThrow();
  });
});

describe("createTableRow", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should return null when table config is missing", () => {
    expect(createTableRow(null)).toBeNull();
    expect(createTableRow(undefined)).toBeNull();
  });

  it("should create a table row with columns", () => {
    const table = {
      rowClass: "test-row",
      itemName: "item",
      columns: [
        { name: "col-a", label: "Col A" },
        { name: "col-b", label: "Col B", type: "number" },
      ],
    };
    const row = createTableRow(table, { "col-a": "hello", "col-b": "42" });
    expect(row).toBeInstanceOf(HTMLTableRowElement);
    expect(row.className).toBe("test-row");
    const inputs = row.querySelectorAll("input");
    expect(inputs).toHaveLength(2);
    expect(inputs[0].value).toBe("hello");
    expect(inputs[0].type).toBe("text");
    expect(inputs[1].value).toBe("42");
    expect(inputs[1].type).toBe("number");
    const removeBtn = row.querySelector(".btn-remove-equip");
    expect(removeBtn).toBeTruthy();
    expect(removeBtn.title).toBe("Eliminar item");
  });

  it("should handle missing data gracefully", () => {
    const table = {
      rowClass: "empty-row",
      columns: [{ name: "col-a", label: "Col A" }],
    };
    const row = createTableRow(table);
    const input = row.querySelector('input[name="col-a"]');
    expect(input.value).toBe("");
  });

  it("should add required attribute and placeholder", () => {
    const table = {
      rowClass: "req-row",
      columns: [{ name: "req-col", label: "Required", required: true }],
    };
    const row = createTableRow(table, { "req-col": "val" });
    const input = row.querySelector('input[name="req-col"]');
    expect(input.required).toBe(true);
    expect(input.placeholder).toBe("Required");
  });

  it("should use column key for data lookup when provided", () => {
    const table = {
      rowClass: "key-row",
      columns: [{ name: "col-name", key: "col-key", label: "Col" }],
    };
    const row = createTableRow(table, { "col-key": "from-key" });
    const input = row.querySelector('input[name="col-name"]');
    expect(input.value).toBe("from-key");
  });

  it("should fall back to name when key is not provided", () => {
    const table = {
      rowClass: "name-row",
      columns: [{ name: "col-name", label: "Col" }],
    };
    const row = createTableRow(table, { "col-name": "from-name" });
    const input = row.querySelector('input[name="col-name"]');
    expect(input.value).toBe("from-name");
  });

  it("should include type='text' as default input type", () => {
    const table = {
      rowClass: "type-row",
      columns: [{ name: "default-type", label: "Default" }],
    };
    const row = createTableRow(table);
    const input = row.querySelector('input[name="default-type"]');
    expect(input.type).toBe("text");
  });

  it("should use default itemName for remove button title", () => {
    const table = {
      rowClass: "no-item-row",
      columns: [{ name: "c", label: "C" }],
    };
    const row = createTableRow(table);
    const removeBtn = row.querySelector(".btn-remove-equip");
    expect(removeBtn.title).toBe("Eliminar elemento");
  });
});

describe("initTable", () => {
  let tbody, addBtn;

  beforeEach(() => {
    document.body.innerHTML = `
      <table>
        <tbody id="test-tbody">
          <tr class="equip-row"><td><input name="col" value="existing"></td></tr>
        </tbody>
      </table>
      <button id="add-btn">Add</button>
    `;
    tbody = document.getElementById("test-tbody");
    addBtn = document.getElementById("add-btn");
  });

  it("should do nothing when table config is null", () => {
    expect(() => initTable(null)).not.toThrow();
  });

  it("should do nothing when tbody or addBtn is missing", () => {
    const table = { tbodyId: "nonexistent", addBtnId: "add-btn", rowClass: "row" };
    expect(() => initTable(table)).not.toThrow();

    const table2 = { tbodyId: "test-tbody", addBtnId: "nonexistent", rowClass: "row" };
    expect(() => initTable(table2)).not.toThrow();
  });

  it("should add a row when add button is clicked", () => {
    const table = {
      tbodyId: "test-tbody",
      addBtnId: "add-btn",
      rowClass: "equip-row",
      columns: [{ name: "col", label: "Col" }],
      itemName: "test",
    };
    initTable(table);
    addBtn.click();
    const rows = tbody.querySelectorAll(".equip-row");
    expect(rows).toHaveLength(2);
  });

  it("should remove row when remove button is clicked", () => {
    const table = {
      tbodyId: "test-tbody",
      addBtnId: "add-btn",
      rowClass: "equip-row",
      columns: [{ name: "col", label: "Col" }],
    };
    initTable(table);
    addBtn.click();
    expect(tbody.querySelectorAll(".equip-row")).toHaveLength(2);
    const removeBtn = tbody.querySelector(".btn-remove-equip");
    removeBtn.click();
    expect(tbody.querySelectorAll(".equip-row")).toHaveLength(1);
  });

  it("should not remove the last remaining row via delegated click", () => {
    const table = {
      tbodyId: "test-tbody",
      addBtnId: "add-btn",
      rowClass: "equip-row",
      columns: [{ name: "col", label: "Col" }],
    };
    document.body.innerHTML = `
      <table>
        <tbody id="test-tbody">
          <tr class="equip-row">
            <td><input name="col" value="x"></td>
            <td><button type="button" class="btn-remove-equip">✕</button></td>
          </tr>
        </tbody>
      </table>
      <button id="add-btn">Add</button>
    `;
    tbody = document.getElementById("test-tbody");
    initTable(table);
    const removeBtn = tbody.querySelector(".btn-remove-equip");
    expect(tbody.querySelectorAll(".equip-row")).toHaveLength(1);
    removeBtn.click();
    expect(tbody.querySelectorAll(".equip-row")).toHaveLength(1);
  });

  it("should handle delegated remove click on tbody", () => {
    const table = {
      tbodyId: "test-tbody",
      addBtnId: "add-btn",
      rowClass: "equip-row",
      columns: [{ name: "col", label: "Col" }],
    };
    initTable(table);
    addBtn.click();
    const rows = tbody.querySelectorAll(".equip-row");
    expect(rows).toHaveLength(2);
    const event = new Event("click");
    const removeBtn = rows[1].querySelector(".btn-remove-equip");
    removeBtn.dispatchEvent(event);
    expect(tbody.querySelectorAll(".equip-row")).toHaveLength(1);
  });
});
