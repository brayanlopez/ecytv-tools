import { restoreTheme } from "../../utils/theme.js";
import { validateForm } from "../common/validation.js";
import { collectFormData, getSalasData } from "./f4-data.js";
import { saveFormToHistory, loadHistory } from "./f4-history.js";
import { generateF4PDF } from "./f4-pdf.js";
import { handleExportJSON, handleExportYAML, handleImport } from "./f4-io.js";
import {
  ASIGNATURAS_SUGERIDAS,
  SALAS_SUGERIDAS,
} from "../../utils/constants.js";

restoreTheme();

document.getElementById("back-link").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "./#formats";
});

const asignaturasDatalist = document.getElementById("asignaturas-sugeridas");
ASIGNATURAS_SUGERIDAS.forEach((a) => {
  const opt = document.createElement("option");
  opt.value = a;
  asignaturasDatalist.appendChild(opt);
});

const salasDatalist = document.getElementById("salas-sugeridas");
SALAS_SUGERIDAS.forEach((s) => {
  const opt = document.createElement("option");
  opt.value = s;
  salasDatalist.appendChild(opt);
});

const form = document.getElementById("f4-form");
const tbody = document.getElementById("sala-tbody");
const addBtn = document.getElementById("add-sala-btn");

addBtn.addEventListener("click", () => {
  const row = document.createElement("tr");
  row.className = "sala-row";
  row.innerHTML = `
    <td><input type="text" name="sala-nombre" placeholder="Sala" list="salas-sugeridas" aria-label="Sala adjudicada"></td>
    <td><input type="date" name="sala-fecha" required aria-label="Fecha"></td>
    <td><input type="time" name="sala-hora-inicio" required aria-label="Hora de inicio"></td>
    <td><input type="time" name="sala-hora-fin" required aria-label="Hora de finalización"></td>
    <td><button type="button" class="btn-remove-equip" title="Eliminar sala">✕</button></td>
  `;
  row.querySelector(".btn-remove-equip").addEventListener("click", () => {
    if (tbody.children.length > 1) {
      row.remove();
      addBtn.focus();
    }
  });
  tbody.appendChild(row);
  const firstInput = row.querySelector("input");
  if (firstInput) firstInput.focus();
});

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-remove-equip");
  if (btn) {
    const row = btn.closest(".sala-row");
    if (tbody.children.length > 1) {
      row.remove();
      addBtn.focus();
    }
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    const rows = tbody.querySelectorAll(".sala-row");
    for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
    const firstRow = tbody.querySelector(".sala-row");
    if (firstRow) {
      firstRow.querySelectorAll("input").forEach((inp) => (inp.value = ""));
    }
  }, 0);
});

function handleGeneratePDF() {
  if (!validateForm(form, "Por favor completa todos los campos obligatorios."))
    return;
  saveFormToHistory(collectFormData, tbody);
  generateF4PDF(() => getSalasData(tbody));
}

function handleSave() {
  saveFormToHistory(collectFormData, tbody);
}

document.getElementById("btn-pdf").addEventListener("click", handleGeneratePDF);
document.getElementById("btn-save").addEventListener("click", handleSave);
document
  .getElementById("btn-export-json")
  .addEventListener("click", () => handleExportJSON(tbody));
document
  .getElementById("btn-export-yaml")
  .addEventListener("click", () => handleExportYAML(tbody));
document
  .getElementById("btn-import")
  .addEventListener("click", () => handleImport(tbody, form));

const btnDownload = document.getElementById("btn-download");
const downloadMenu = document.getElementById("download-menu");

function closeDropdown() {
  downloadMenu.classList.remove("show");
  btnDownload.classList.remove("active");
  btnDownload.setAttribute("aria-expanded", "false");
}

btnDownload.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = downloadMenu.classList.contains("show");
  downloadMenu.classList.toggle("show");
  btnDownload.classList.toggle("active");
  btnDownload.setAttribute("aria-expanded", !isOpen);
});

btnDownload.addEventListener("keydown", (e) => {
  if (
    e.key === "ArrowDown" ||
    e.key === "ArrowUp" ||
    e.key === "Enter" ||
    e.key === " "
  ) {
    e.preventDefault();
    if (!downloadMenu.classList.contains("show")) {
      downloadMenu.classList.add("show");
      btnDownload.classList.add("active");
      btnDownload.setAttribute("aria-expanded", "true");
    }
    const items = downloadMenu.querySelectorAll(".dropdown-item");
    if (items.length > 0) items[0].focus();
  }
});

downloadMenu.addEventListener("keydown", (e) => {
  const items = Array.from(downloadMenu.querySelectorAll(".dropdown-item"));
  const currentIndex = items.indexOf(document.activeElement);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const next = (currentIndex + 1) % items.length;
    items[next].focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prev = (currentIndex - 1 + items.length) % items.length;
    items[prev].focus();
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeDropdown();
    btnDownload.focus();
  } else if (e.key === "Enter" || e.key === " ") {
    if (document.activeElement && items.includes(document.activeElement)) {
      e.preventDefault();
      document.activeElement.click();
    }
  }
});

document.addEventListener("click", () => {
  closeDropdown();
});

downloadMenu.addEventListener("click", () => {
  closeDropdown();
});

loadHistory(tbody, form);
