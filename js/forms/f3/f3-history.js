import { createHistoryManager } from "../common/history.js";
import { escHtml } from "../common/esc-html.js";

const historyManager = createHistoryManager("f3-history");

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
      const subtitle = entry.data.autorizado
        ? entry.data.autorizado +
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
  if (!data.proyecto.trim() && !data.autorizado.trim()) {
    window.EcytvUI.showSnackbar(
      "Completa al menos el nombre del proyecto y el autorizado antes de guardar.",
      "warning",
    );
    return false;
  }
  const history = historyManager.addEntry(data);
  const listEl = document.getElementById("history-list");
  const cardEl = document.getElementById("history-card");
  const form = document.getElementById("f3-form");
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
  document.getElementById("autorizado").value = d.autorizado || "";
  document.getElementById("tipo-documento").value = d["tipo-documento"] || "";
  document.getElementById("numero-documento").value = d["numero-documento"] || "";
  document.getElementById("tiun").value = d.tiun || "";
  document.getElementById("celular").value = d.celular || "";
  document.getElementById("lugar").value = d.lugar || "";
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
    firstRow.querySelector('input[name="equipo-tipo"]').value = "";
    firstRow.querySelector('input[name="equipo-cantidad"]').value = "";
    firstRow.querySelector('input[name="equipo-codigo"]').value = "";
    firstRow.querySelector('input[name="equipo-elemento"]').value = "";
  }

  const equipos = d.equipos || [];
  equipos.forEach((eq, idx) => {
    if (idx === 0 && firstRow) {
      firstRow.querySelector('input[name="equipo-item"]').value = eq.item || "";
      firstRow.querySelector('input[name="equipo-tipo"]').value = eq.tipo || "";
      firstRow.querySelector('input[name="equipo-cantidad"]').value = eq.cantidad || "";
      firstRow.querySelector('input[name="equipo-codigo"]').value = eq.codigo || "";
      firstRow.querySelector('input[name="equipo-elemento"]').value = eq.elemento || "";
    } else {
      const row = document.createElement("tr");
      row.className = "equip-row";
      row.innerHTML = `
        <td data-label="Item"><input type="text" class="item-num" name="equipo-item" placeholder="Item" value="${escHtml(eq.item || "")}" aria-label="Número de item"></td>
        <td data-label="Tipo"><input type="text" name="equipo-tipo" placeholder="Tipo" required value="${escHtml(eq.tipo || "")}" aria-label="Tipo"></td>
        <td data-label="Cantidad"><input type="number" name="equipo-cantidad" placeholder="Cantidad" required value="${escHtml(eq.cantidad || "")}" aria-label="Cantidad" min="1"></td>
        <td data-label="Código"><input type="text" name="equipo-codigo" placeholder="Código" required value="${escHtml(eq.codigo || "")}" aria-label="Código"></td>
        <td data-label="Elemento"><input type="text" name="equipo-elemento" placeholder="Elemento" required value="${escHtml(eq.elemento || "")}" aria-label="Elemento"></td>
        <td data-label=""><button type="button" class="btn-remove-equip" title="Eliminar elemento">✕</button></td>
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
