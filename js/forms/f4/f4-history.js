import { createHistoryManager } from "../common/history.js";
import { escHtml } from "../common/esc-html.js";

const historyManager = createHistoryManager("f4-history");

export function getHistoryManager() {
  return historyManager;
}

export function renderHistory(history, listEl, cardEl, tbody, form) {
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
      const title = entry.data.proyecto || "(sin proyecto)";
      const subtitle = entry.data["directo-responsable"]
        ? entry.data["directo-responsable"] +
          (entry.data.asignatura ? " — " + entry.data.asignatura : "")
        : "";
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
    btn.addEventListener("click", () =>
      restoreFromHistory(btn.dataset.id, tbody, form),
    );
  });
  listEl.querySelectorAll(".btn-history-delete").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteFromHistory(btn.dataset.id, listEl, cardEl, tbody, form),
    );
  });
}

export function saveFormToHistory(collectFormData, tbody) {
  const data = collectFormData(tbody);
  if (!data.proyecto.trim() && !data["directo-responsable"].trim()) {
    window.EcytvUI.showSnackbar(
      "Completa al menos el nombre del proyecto y el directo responsable antes de guardar.",
      "warning",
    );
    return false;
  }
  const history = historyManager.addEntry(data);
  const listEl = document.getElementById("history-list");
  const cardEl = document.getElementById("history-card");
  const form = document.getElementById("f4-form");
  renderHistory(history, listEl, cardEl, tbody, form);
  window.EcytvUI.showSnackbar("Solicitud guardada en el historial.", "success");
  return true;
}

export function loadHistory(tbody, form) {
  const history = historyManager.load();
  const listEl = document.getElementById("history-list");
  const cardEl = document.getElementById("history-card");
  renderHistory(history, listEl, cardEl, tbody, form);
}

function restoreFromHistory(id, tbody, form) {
  const entry = historyManager.getEntry(id);
  if (!entry) return;

  const d = entry.data;
  document.getElementById("proyecto").value = d.proyecto || "";
  document.getElementById("asignatura").value = d.asignatura || "";
  document.getElementById("docente").value = d.docente || "";
  document.getElementById("directo-responsable").value =
    d["directo-responsable"] || "";
  document.getElementById("tipo-documento").value = d["tipo-documento"] || "";
  document.getElementById("numero-documento").value =
    d["numero-documento"] || "";
  document.getElementById("tiun").value = d.tiun || "";
  document.getElementById("observaciones").value = d.observaciones || "";

  const rows = tbody.querySelectorAll(".sala-row");
  for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
  const firstRow = tbody.querySelector(".sala-row");
  if (firstRow) {
    firstRow.querySelector('input[name="sala-nombre"]').value = "";
    firstRow.querySelector('input[name="sala-fecha"]').value = "";
    firstRow.querySelector('input[name="sala-hora-inicio"]').value = "";
    firstRow.querySelector('input[name="sala-hora-fin"]').value = "";
  }

  const salas = d.salas || [];
  salas.forEach((sala, idx) => {
    if (idx === 0 && firstRow) {
      firstRow.querySelector('input[name="sala-nombre"]').value =
        sala.nombre || "";
      firstRow.querySelector('input[name="sala-fecha"]').value =
        sala.fecha || "";
      firstRow.querySelector('input[name="sala-hora-inicio"]').value =
        sala["hora-inicio"] || "";
      firstRow.querySelector('input[name="sala-hora-fin"]').value =
        sala["hora-fin"] || "";
    } else {
      const row = document.createElement("tr");
      row.className = "sala-row";
      row.innerHTML = `
        <td><input type="text" name="sala-nombre" placeholder="Sala" list="salas-sugeridas" value="${escHtml(sala.nombre || "")}" aria-label="Sala adjudicada"></td>
        <td><input type="date" name="sala-fecha" required value="${escHtml(sala.fecha || "")}" aria-label="Fecha"></td>
        <td><input type="time" name="sala-hora-inicio" required value="${escHtml(sala["hora-inicio"] || "")}" aria-label="Hora de inicio"></td>
        <td><input type="time" name="sala-hora-fin" required value="${escHtml(sala["hora-fin"] || "")}" aria-label="Hora de finalización"></td>
        <td><button type="button" class="btn-remove-equip" title="Eliminar sala">✕</button></td>
      `;
      row.querySelector(".btn-remove-equip").addEventListener("click", () => {
        if (tbody.children.length > 1) row.remove();
      });
      tbody.appendChild(row);
    }
  });

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteFromHistory(id, listEl, cardEl, tbody, form) {
  const history = historyManager.removeEntry(id);
  renderHistory(history, listEl, cardEl, tbody, form);
}
