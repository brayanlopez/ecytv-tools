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
