import {
  getValue,
  setValue,
  getChecked,
  setFieldValues,
  createTableRow,
  initTable,
} from "./dom.js";
import { initDropdown } from "./dropdown.js";
import { validateForm } from "./validation.js";
import { downloadJSON, downloadYAML, importFromFile } from "./io-config.js";
import { createHistoryManager } from "./history.js";
import { escHtml } from "./esc-html.js";

export function createFormFactory(config) {
  const { formId, fields, table, datalists, historyConfig, generators, buildExportFilename } =
    config;

  const historyManager = createHistoryManager(historyConfig.key);

  function getFormEl() {
    return document.getElementById(formId);
  }

  function getTbody() {
    return table ? document.getElementById(table.tbodyId) : null;
  }

  function collectTableData(tbody) {
    if (!table || !tbody) return [];
    const rows = tbody.querySelectorAll(`.${table.rowClass}`);
    return Array.from(rows).map((row) => {
      const data = {};
      for (const col of table.columns) {
        const inputName = col.name;
        data[col.key || col.name] = row.querySelector(`[name="${inputName}"]`)?.value ?? "";
      }
      return data;
    });
  }

  function collectFormData(tbody) {
    const data = {};
    for (const field of fields) {
      if (field.type === "checkbox") {
        data[field.id] = getChecked(field.id);
      } else {
        data[field.id] = getValue(field.id);
      }
    }
    const tb = tbody ?? getTbody();
    if (table && tb) {
      data[table.dataKey] = collectTableData(tb);
    }
    return data;
  }

  function restoreTableData(tbody, items) {
    if (!table || !tbody) return;
    const rows = tbody.querySelectorAll(`.${table.rowClass}`);
    for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
    const firstRow = tbody.querySelector(`.${table.rowClass}`);
    if (firstRow) {
      firstRow.querySelectorAll("input").forEach((inp) => {
        inp.value = "";
      });
    }
    (items || []).forEach((item, idx) => {
      if (idx === 0 && firstRow) {
        for (const col of table.columns) {
          const input = firstRow.querySelector(`[name="${col.name}"]`);
          if (input) input.value = item[col.key || col.name] ?? "";
        }
      } else {
        const row = createTableRow(table, item);
        const removeBtn = row.querySelector(".btn-remove-equip");
        if (removeBtn) {
          removeBtn.addEventListener("click", () => {
            if (tbody.children.length > 1) row.remove();
          });
        }
        tbody.appendChild(row);
      }
    });
  }

  function restoreFormData(data, tbody, form) {
    if (!data) return;

    setFieldValues(fields, data);

    const sameDayField = fields.find((f) => f.sameDayAs);
    if (sameDayField) {
      const sourceVal = getValue(sameDayField.sameDayAs);
      if (data["mismo-dia"] && sourceVal) {
        setValue(sameDayField.id, sourceVal);
        const el = document.getElementById(sameDayField.id);
        if (el) el.disabled = true;
      } else {
        const el = document.getElementById(sameDayField.id);
        if (el) el.disabled = false;
      }
    }

    const tb = tbody ?? getTbody();
    const dataKey = table?.dataKey;
    if (table && tb && dataKey && data[dataKey]) {
      restoreTableData(tb, data[dataKey]);
    }

    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initBackLink() {
    const link = document.getElementById("back-link");
    if (link) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./#formats";
      });
    }
  }

  function initDatalists() {
    if (!datalists) return;
    for (const dl of datalists) {
      const el = document.getElementById(dl.elementId);
      if (!el) continue;
      for (const val of dl.source) {
        const opt = document.createElement("option");
        opt.value = val;
        el.appendChild(opt);
      }
    }
  }

  function initSameDayCheckbox() {
    const sameDayField = fields.find((f) => f.sameDayAs);
    if (!sameDayField) return;
    const flagCheckbox = document.getElementById("mismo-dia");
    const sourceInput = document.getElementById(sameDayField.sameDayAs);
    const targetInput = document.getElementById(sameDayField.id);
    if (!flagCheckbox || !sourceInput || !targetInput) return;

    flagCheckbox.addEventListener("change", () => {
      if (flagCheckbox.checked && sourceInput.value) {
        targetInput.value = sourceInput.value;
        targetInput.disabled = true;
      } else {
        targetInput.disabled = false;
      }
    });

    sourceInput.addEventListener("input", () => {
      if (flagCheckbox.checked && sourceInput.value) {
        targetInput.value = sourceInput.value;
      }
    });
  }

  function initReset() {
    const form = getFormEl();
    if (!form) return;
    form.addEventListener("reset", () => {
      setTimeout(() => {
        if (table) {
          const tbody = document.getElementById(table.tbodyId);
          if (tbody) {
            const rows = tbody.querySelectorAll(`.${table.rowClass}`);
            for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
            const firstRow = tbody.querySelector(`.${table.rowClass}`);
            if (firstRow) {
              firstRow.querySelectorAll("input").forEach((inp) => {
                inp.value = "";
              });
            }
          }
        } else {
          form.querySelectorAll("input, select, textarea").forEach((el) => {
            el.value = "";
            if (el.type === "checkbox") el.checked = false;
          });
        }
        const sameDayField = fields.find((f) => f.sameDayAs);
        if (sameDayField) {
          const el = document.getElementById(sameDayField.id);
          if (el) el.disabled = false;
        }
      }, 0);
    });
  }

  function init() {
    initBackLink();
    initDatalists();
    initSameDayCheckbox();
    initTable(table);
    initReset();
    initDropdown("btn-download", "download-menu");
    bindButtons();
  }

  function saveFormToHistory(collectFn, tbody) {
    const data = collectFn(tbody);
    if (!historyConfig.isValid(data)) {
      window.EcytvUI.showSnackbar(historyConfig.warnMsg, "warning");
      return false;
    }
    const history = historyManager.addEntry(data);
    const listEl = document.getElementById("history-list");
    const cardEl = document.getElementById("history-card");
    const frm = getFormEl();
    renderHistory(history, listEl, cardEl, tbody, frm);
    window.EcytvUI.showSnackbar(historyConfig.successMsg, "success");
    return true;
  }

  function loadHistory(tbody, form) {
    const history = historyManager.load();
    const listEl = document.getElementById("history-list");
    const cardEl = document.getElementById("history-card");
    renderHistory(history, listEl, cardEl, tbody, form);
  }

  function renderHistory(history, listEl, cardEl, tbody, form) {
    if (!history.length) {
      cardEl.style.display = "none";
      return;
    }
    cardEl.style.display = "";
    listEl.innerHTML = history
      .map((entry) => {
        const d = new Date(entry.savedAt);
        const dateStr = d.toLocaleDateString("es-CO", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const title = historyConfig.getTitle(entry.data);
        const subtitle = historyConfig.getSubtitle ? historyConfig.getSubtitle(entry.data) : "";
        return `<div class="history-entry">
        <div class="history-entry-info">
          <div class="history-entry-title">${escHtml(title)}</div>
          <div class="history-entry-meta">${escHtml(dateStr)}${subtitle ? " · " + escHtml(subtitle) : ""}</div>
        </div>
        <div class="history-entry-actions">
          <button type="button" class="btn-history-restore" data-id="${entry.id}">Restaurar</button>
          <button type="button" class="btn-history-delete" data-id="${entry.id}">Eliminar</button>
        </div>
      </div>`;
      })
      .join("");

    listEl.querySelectorAll(".btn-history-restore").forEach((btn) => {
      btn.addEventListener("click", () => restoreFromHistory(btn.dataset.id, tbody, form));
    });
    listEl.querySelectorAll(".btn-history-delete").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteFromHistory(btn.dataset.id, listEl, cardEl, tbody, form),
      );
    });
  }

  function restoreFromHistory(id, tbody, form) {
    const entry = historyManager.getEntry(id);
    if (!entry) return;
    restoreFormData(entry.data, tbody, form);
  }

  function deleteFromHistory(id, listEl, cardEl, tbody, form) {
    const history = historyManager.removeEntry(id);
    renderHistory(history, listEl, cardEl, tbody, form);
  }

  function validateAndRun(handler, tbody) {
    const form = getFormEl();
    if (!validateForm(form, "Por favor completa todos los campos obligatorios.")) return;
    const tb = tbody ?? getTbody();
    const formData = collectFormData(tb);
    saveFormToHistory(() => formData, tb);
    handler(formData);
  }

  function handleGeneratePDF() {
    validateAndRun(generators?.pdf);
  }
  function handleGenerateODS() {
    if (generators?.ods) validateAndRun(generators.ods);
  }
  function handleGenerateXLSX() {
    if (generators?.xlsx) validateAndRun(generators.xlsx);
  }

  function handleSave(tbody) {
    const tb = tbody ?? getTbody();
    saveFormToHistory(collectFormData, tb);
  }

  function handleExportJSON(tbody) {
    const tb = tbody ?? getTbody();
    const data = collectFormData(tb);
    const filename = buildExportFilename ? buildExportFilename(data) : formId;
    downloadJSON(data, filename);
    window.EcytvUI.showSnackbar("Datos exportados en JSON correctamente.", "success");
  }

  function handleExportYAML(tbody) {
    const tb = tbody ?? getTbody();
    const data = collectFormData(tb);
    const filename = buildExportFilename ? buildExportFilename(data) : formId;
    downloadYAML(data, filename);
    window.EcytvUI.showSnackbar("Datos exportados en YAML correctamente.", "success");
  }

  async function handleImport(tbody, form) {
    try {
      const data = await importFromFile();
      restoreFormData(data, tbody, form);
      window.EcytvUI.showSnackbar("Datos importados correctamente.", "success");
    } catch (err) {
      window.EcytvUI.showSnackbar(err.message, "error");
    }
  }

  function bindButtons() {
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => fn());
    };
    bind("btn-pdf", handleGeneratePDF);
    bind("btn-ods", handleGenerateODS);
    bind("btn-xlsx", handleGenerateXLSX);
    bind("btn-save", handleSave);
    bind("btn-export-json", handleExportJSON);
    bind("btn-export-yaml", handleExportYAML);
    bind("btn-import", handleImport);
  }

  return {
    collectFormData,
    restoreFormData,
    getHistoryManager: () => historyManager,
    saveFormToHistory,
    loadHistory,
    renderHistory,
    handleSave,
    handleExportJSON,
    handleExportYAML,
    handleImport,
    handleGeneratePDF,
    init,
  };
}
