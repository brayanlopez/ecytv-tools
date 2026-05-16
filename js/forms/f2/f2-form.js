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

loadHistory(form);
