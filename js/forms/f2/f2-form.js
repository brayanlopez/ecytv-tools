import { restoreTheme } from "../../utils/theme.js";
import { validateForm } from "../common/validation.js";
import { collectFormData } from "./f2-data.js";
import { saveFormToHistory, loadHistory } from "./f2-history.js";
import { generateF2PDF } from "./f2-pdf.js";

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
  if (!validateForm(form, "Por favor completa todos los campos obligatorios.")) return;
  saveFormToHistory(collectFormData);
  generateF2PDF();
}

function handleSave() {
  saveFormToHistory(collectFormData);
}

document.getElementById("btn-pdf").addEventListener("click", handleGeneratePDF);
document.getElementById("btn-save").addEventListener("click", handleSave);

loadHistory(form);
