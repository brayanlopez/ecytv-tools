import { createHistoryManager } from "../common/history.js";
import { escHtml } from "../common/esc-html.js";

const historyManager = createHistoryManager("f1-history");

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
      const subtitle = entry.data.responsable
        ? entry.data.responsable +
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
  if (!data.proyecto.trim() && !data.responsable.trim()) {
    window.EcytvUI.showSnackbar(
      "Completa al menos el nombre del proyecto y el responsable antes de guardar.",
      "warning",
    );
    return false;
  }
  const history = historyManager.addEntry(data);
  const listEl = document.getElementById("history-list");
  const cardEl = document.getElementById("history-card");
  const form = document.getElementById("f1-form");
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
  document.getElementById("responsable").value = d.responsable || "";
  document.getElementById("celular").value = d.celular || "";
  document.getElementById("tiun").value = d.tiun || "";
  document.getElementById("lugar").value = d.lugar || "";
  document.getElementById("tipo-prestamo").value = d["tipo-prestamo"] || "";
  document.getElementById("fecha-retiro").value = d["fecha-retiro"] || "";
  document.getElementById("fecha-entrega").value = d["fecha-entrega"] || "";
  document.getElementById("observaciones").value = d.observaciones || "";

  const mismoDia = document.getElementById("mismo-dia");
  mismoDia.checked = d["mismo-dia"] || false;
  if (mismoDia.checked && d["fecha-retiro"]) {
    document.getElementById("fecha-entrega").value = d["fecha-retiro"];
    document.getElementById("fecha-entrega").disabled = true;
  } else {
    document.getElementById("fecha-entrega").disabled = false;
  }

  const rows = tbody.querySelectorAll(".equip-row");
  for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
  const firstRow = tbody.querySelector(".equip-row");
  if (firstRow) {
    firstRow.querySelector('input[name="equipo-item"]').value = "";
    firstRow.querySelector('input[name="equipo-nombre"]').value = "";
    firstRow.querySelector('input[name="equipo-consecutivo"]').value = "";
  }

  const equipos = d.equipos || [];
  equipos.forEach((eq, idx) => {
    if (idx === 0 && firstRow) {
      firstRow.querySelector('input[name="equipo-item"]').value = eq.item || "";
      firstRow.querySelector('input[name="equipo-nombre"]').value =
        eq.nombre || "";
      firstRow.querySelector('input[name="equipo-consecutivo"]').value =
        eq.consecutivo || "";
    } else {
      const row = document.createElement("tr");
      row.className = "equip-row";
      row.innerHTML = `
        <td data-label="Item"><input type="text" class="item-num" name="equipo-item" placeholder="Item" value="${escHtml(eq.item || "")}" aria-label="Número de item"></td>
        <td data-label="Equipo"><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required value="${escHtml(eq.nombre || "")}" aria-label="Nombre del equipo"></td>
        <td data-label="Consecutivo"><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required value="${escHtml(eq.consecutivo || "")}" aria-label="Consecutivo vigente"></td>
        <td data-label=""><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
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
