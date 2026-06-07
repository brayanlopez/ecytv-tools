import { escHtml } from "./esc-html.js";

export function getValue(id) {
  return document.getElementById(id)?.value ?? "";
}

export function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.value = val ?? "";
  }
}

export function getChecked(id) {
  return document.getElementById(id)?.checked ?? false;
}

export function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.checked = !!val;
  }
}

export function getTableData(tbody, columns) {
  if (!tbody) {
    return [];
  }
  const rowSelector = tbody.querySelector("tr")?.className
    ? `.${tbody.querySelector("tr").className}`
    : "tr";
  return Array.from(tbody.querySelectorAll(rowSelector)).map((row) => {
    const data = {};
    for (const col of columns) {
      data[col.name] = row.querySelector(`[name="${col.name}"]`)?.value ?? "";
    }
    return data;
  });
}

export function setFieldValues(fields, data) {
  for (const field of fields) {
    if (field.type === "checkbox") {
      setChecked(field.id, data[field.id]);
    } else {
      setValue(field.id, data[field.id]);
    }
  }
}

export function createTableRow(table, data = {}) {
  if (!table) {
    return null;
  }
  const row = document.createElement("tr");
  row.className = table.rowClass;
  const cols = table.columns
    .map((col) => {
      const val = escHtml(data[col.key || col.name] ?? "");
      return `<td data-label="${escHtml(col.label)}"><input type="${col.type || "text"}" name="${col.name}" placeholder="${escHtml(col.placeholder || col.label)}" aria-label="${escHtml(col.label)}"${col.required ? " required" : ""} value="${val}"></td>`;
    })
    .join("");
  row.innerHTML =
    cols +
    `<td data-label=""><button type="button" class="btn-remove-equip" title="Eliminar ${table.itemName || "elemento"}">✕</button></td>`;
  return row;
}

export function initTable(table) {
  if (!table) {
    return;
  }
  const tbody = document.getElementById(table.tbodyId);
  const addBtn = document.getElementById(table.addBtnId);
  if (!tbody || !addBtn) {
    return;
  }

  addBtn.addEventListener("click", () => {
    const row = createTableRow(table);
    if (!row) {
      return;
    }
    const removeBtn = row.querySelector(".btn-remove-equip");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        if (tbody.children.length > 1) {
          row.remove();
          addBtn.focus();
        }
      });
    }
    tbody.appendChild(row);
    const firstInput = row.querySelector("input");
    if (firstInput) {
      firstInput.focus();
    }
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove-equip");
    if (btn) {
      const row = btn.closest(`.${table.rowClass}`);
      if (tbody.children.length > 1) {
        row.remove();
        addBtn.focus();
      }
    }
  });
}
