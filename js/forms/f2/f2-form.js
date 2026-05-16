import { restoreTheme } from "../../utils/theme.js";
import { validateForm } from "../common/validation.js";
import { collectFormData } from "./f2-data.js";
import { saveFormToHistory, loadHistory } from "./f2-history.js";
import { generateF2PDF } from "./f2-pdf.js";
import { handleExportJSON, handleExportYAML, handleImport } from "./f2-io.js";

restoreTheme();

document.getElementById("back-link").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/#formats";
});

const form = document.getElementById("f2-form");

form.addEventListener("reset", () => {
  setTimeout(() => {
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.value = "";
      el.checked = false;
    });
  }, 0);
});

function handleGeneratePDF() {
  if (!validateForm(form, "Por favor completa todos los campos obligatorios."))
    return;
  saveFormToHistory(collectFormData);
  generateF2PDF();
}

function handleSave() {
  saveFormToHistory(collectFormData);
}

document.getElementById("btn-pdf").addEventListener("click", handleGeneratePDF);
document.getElementById("btn-save").addEventListener("click", handleSave);
document
  .getElementById("btn-export-json")
  .addEventListener("click", () => handleExportJSON());
document
  .getElementById("btn-export-yaml")
  .addEventListener("click", () => handleExportYAML());
document
  .getElementById("btn-import")
  .addEventListener("click", () => handleImport(form));

const btnDownload = document.getElementById("btn-download");
const downloadMenu = document.getElementById("download-menu");

btnDownload.addEventListener("click", (e) => {
  e.stopPropagation();
  downloadMenu.classList.toggle("show");
  btnDownload.classList.toggle("active");
});

document.addEventListener("click", () => {
  downloadMenu.classList.remove("show");
  btnDownload.classList.remove("active");
});

downloadMenu.addEventListener("click", () => {
  downloadMenu.classList.remove("show");
  btnDownload.classList.remove("active");
});

loadHistory(form);
