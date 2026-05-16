import { createHistoryManager } from "../common/history.js";
import { escHtml } from "../common/esc-html.js";

const historyManager = createHistoryManager("f2-history");

export function getHistoryManager() {
  return historyManager;
}

export function renderHistory(history, listEl, cardEl, form) {
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
      const title = entry.data.nombre || "(sin nombre)";
      return `<div class="history-entry">
        <div class="history-entry-info">
          <div class="history-entry-title">${escHtml(title)}</div>
          <div class="history-entry-meta">${escHtml(dateStr)}</div>
        </div>
        <div class="history-entry-actions">
          <button type="button" class="btn-history-restore" data-id="${entry.id}">Restaurar</button>
          <button type="button" class="btn-history-delete" data-id="${entry.id}">Eliminar</button>
        </div>
      </div>`;
    })
    .join("");

  listEl.querySelectorAll(".btn-history-restore").forEach((btn) => {
    btn.addEventListener("click", () => restoreFromHistory(btn.dataset.id, form));
  });
  listEl.querySelectorAll(".btn-history-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteFromHistory(btn.dataset.id, listEl, cardEl, form));
  });
}

export function saveFormToHistory(collectFormData) {
  const data = collectFormData();
  if (!data.nombre.trim()) {
    window.EcytvUI.showSnackbar(
      "Completa al menos el nombre antes de guardar.",
      "warning",
    );
    return false;
  }
  const history = historyManager.addEntry(data);
  const listEl = document.getElementById("history-list");
  const cardEl = document.getElementById("history-card");
  const form = document.getElementById("f2-form");
  renderHistory(history, listEl, cardEl, form);
  window.EcytvUI.showSnackbar("Acta guardada en el historial.", "success");
  return true;
}

export function loadHistory(form) {
  const history = historyManager.load();
  const listEl = document.getElementById("history-list");
  const cardEl = document.getElementById("history-card");
  renderHistory(history, listEl, cardEl, form);
}

function restoreFromHistory(id, form) {
  const entry = historyManager.getEntry(id);
  if (!entry) return;

  const d = entry.data;
  document.getElementById("nombre").value = d.nombre || "";
  document.getElementById("tipo-documento").value = d["tipo-documento"] || "";
  document.getElementById("numero-documento").value = d["numero-documento"] || "";
  document.getElementById("contacto").value = d.contacto || "";
  document.getElementById("periodo-inicial").value = d["periodo-inicial"] || "";
  document.getElementById("periodo-final").value = d["periodo-final"] || "";
  document.getElementById("fecha-constancia").value = d["fecha-constancia"] || "";
  document.getElementById("firma-nombre").checked = d["firma-nombre"] || false;
  document.getElementById("observaciones").value = d.observaciones || "";

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteFromHistory(id, listEl, cardEl, form) {
  const history = historyManager.removeEntry(id);
  renderHistory(history, listEl, cardEl, form);
}
