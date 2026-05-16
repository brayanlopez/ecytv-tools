import { restoreTheme } from "../../utils/theme.js";
import { validateForm } from "../common/validation.js";
import { collectFormData, getEquipData } from "./f1-data.js";
import { saveFormToHistory, loadHistory } from "./f1-history.js";
import { generateF1PDF } from "./f1-pdf.js";
import { generateF1ODS } from "./f1-ods.js";
import { generateF1XLSX } from "./f1-xlsx.js";
import { handleExportJSON, handleExportYAML, handleImport } from "./f1-io.js";
import { ASIGNATURAS_SUGERIDAS } from "../../utils/constants.js";

restoreTheme();

document.getElementById("back-link").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "./#formats";
});

const datalist = document.getElementById("asignaturas-sugeridas");
ASIGNATURAS_SUGERIDAS.forEach((a) => {
  const opt = document.createElement("option");
  opt.value = a;
  datalist.appendChild(opt);
});

const form = document.getElementById("f1-form");
const tbody = document.getElementById("equip-tbody");
const addBtn = document.getElementById("add-equip-btn");
const mismoDia = document.getElementById("mismo-dia");
const fechaRetiro = document.getElementById("fecha-retiro");
const fechaEntrega = document.getElementById("fecha-entrega");

mismoDia.addEventListener("change", () => {
  if (mismoDia.checked && fechaRetiro.value) {
    fechaEntrega.value = fechaRetiro.value;
    fechaEntrega.disabled = true;
  } else {
    fechaEntrega.disabled = false;
  }
});

fechaRetiro.addEventListener("input", () => {
  if (mismoDia.checked && fechaRetiro.value) {
    fechaEntrega.value = fechaRetiro.value;
  }
});

addBtn.addEventListener("click", () => {
  const row = document.createElement("tr");
  row.className = "equip-row";
  row.innerHTML = `
    <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" aria-label="Número de item"></td>
    <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required aria-label="Nombre del equipo"></td>
    <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required aria-label="Consecutivo vigente"></td>
    <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
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
    const row = btn.closest(".equip-row");
    if (tbody.children.length > 1) {
      row.remove();
      addBtn.focus();
    }
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    const rows = tbody.querySelectorAll(".equip-row");
    for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
    const firstRow = tbody.querySelector(".equip-row");
    if (firstRow) {
      firstRow.querySelectorAll("input").forEach((inp) => (inp.value = ""));
    }
    fechaEntrega.disabled = false;
  }, 0);
});

function handleGeneratePDF() {
  if (!validateForm(form, "Por favor completa todos los campos obligatorios."))
    return;
  const tbody = document.getElementById("equip-tbody");
  saveFormToHistory(collectFormData, tbody);
  generateF1PDF(() => getEquipData(tbody));
}

function handleGenerateODS() {
  if (!validateForm(form, "Por favor completa todos los campos obligatorios."))
    return;
  const tbody = document.getElementById("equip-tbody");
  saveFormToHistory(collectFormData, tbody);
  generateF1ODS(() => getEquipData(tbody));
}

function handleGenerateXLSX() {
  if (!validateForm(form, "Por favor completa todos los campos obligatorios."))
    return;
  const tbody = document.getElementById("equip-tbody");
  saveFormToHistory(collectFormData, tbody);
  generateF1XLSX(() => getEquipData(tbody));
}

function handleSave() {
  saveFormToHistory(collectFormData, tbody);
}

document.getElementById("btn-pdf").addEventListener("click", handleGeneratePDF);
document.getElementById("btn-ods").addEventListener("click", handleGenerateODS);
document
  .getElementById("btn-xlsx")
  .addEventListener("click", handleGenerateXLSX);
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
