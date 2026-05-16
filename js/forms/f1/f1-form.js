import { restoreTheme } from "../../utils/theme.js";
import { validateForm } from "../common/validation.js";
import { collectFormData, getEquipData } from "./f1-data.js";
import { saveFormToHistory, loadHistory } from "./f1-history.js";
import { generateF1PDF } from "./f1-pdf.js";
import { generateF1ODS } from "./f1-ods.js";
import { generateF1XLSX } from "./f1-xlsx.js";

restoreTheme();

document.getElementById("back-link").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/#formats";
});

const ASIGNATURAS_SUGERIDAS = [
  "Sonido I",
  "Sonido II",
  "Taller de Realización y Producción I",
  "Taller de Realización y Producción II",
  "Taller de Realización y Producción III",
  "Taller de Realización y Producción IV",
  "Taller de realización y producción V",
  "Cinefotografía I ",
  "Cinefotografía II",
  "Dirección de Arte",
  "Dirección de Actores I",
  "Dirección de Actores II",
];
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
    <td><input type="text" class="item-num" name="equipo-item" placeholder="Item"></td>
    <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required></td>
    <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required></td>
    <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
  `;
  row.querySelector(".btn-remove-equip").addEventListener("click", () => {
    if (tbody.children.length > 1) row.remove();
  });
  tbody.appendChild(row);
});

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-remove-equip");
  if (btn) {
    const row = btn.closest(".equip-row");
    if (tbody.children.length > 1) row.remove();
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

loadHistory(tbody, form);
