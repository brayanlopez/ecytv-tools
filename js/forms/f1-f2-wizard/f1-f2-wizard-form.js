import { getValue, getChecked, setValue, initTable } from "../common/dom.js";
import { f1Config } from "../f1/f1-config.js";
import { f2Config } from "../f2/f2-config.js";
import { restoreTheme } from "../../utils/theme.js";
import { escHtml } from "../common/esc-html.js";
import { generateCombinedPDF } from "./f1-f2-wizard-pdf.js";

restoreTheme();

let currentStep = 1;
let carnetFile = null;

function getStepEl(step) {
  return document.querySelector(`.step-panel[data-step="${step}"]`);
}

function getIndicatorEl(step) {
  return document.querySelector(`.step-indicator [data-step="${step}"]`);
}

function validateStep(step) {
  if (step === 1) {
    const required = [
      "proyecto",
      "asignatura",
      "docente",
      "responsable",
      "celular",
      "tiun",
      "lugar",
      "tipo-prestamo",
      "fecha-retiro",
    ];
    for (const id of required) {
      if (!getValue(id).trim()) {
        window.EcytvUI.showSnackbar(
          "Completa todos los campos obligatorios del F1.",
          "warning",
        );
        return false;
      }
    }
    const tbody = document.getElementById("equip-tbody");
    if (tbody) {
      const rows = tbody.querySelectorAll(".equip-row");
      let valid = true;
      rows.forEach((row) => {
        const nombre = row
          .querySelector('[name="equipo-nombre"]')
          ?.value?.trim();
        const consecutivo = row
          .querySelector('[name="equipo-consecutivo"]')
          ?.value?.trim();
        if (!nombre || !consecutivo) valid = false;
      });
      if (!valid) {
        window.EcytvUI.showSnackbar(
          "Completa todos los equipos (nombre y consecutivo).",
          "warning",
        );
        return false;
      }
    }
    return true;
  }
  if (step === 2) {
    const required = [
      "tipo-documento",
      "numero-documento",
      "contacto",
      "periodo-inicial",
      "periodo-final",
      "fecha-constancia",
    ];
    for (const id of required) {
      if (!getValue(id).trim()) {
        window.EcytvUI.showSnackbar(
          "Completa todos los campos obligatorios del F2.",
          "warning",
        );
        return false;
      }
    }
    return true;
  }
  return true;
}

function preFillStep2() {
  setValue("nombre", getValue("responsable"));
  setValue("contacto", getValue("celular"));
  setValue("observaciones", getValue("observaciones"));
  ["nombre", "contacto", "observaciones"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.readOnly = true;
  });
}

function goToStep(n) {
  if (n > currentStep && !validateStep(currentStep)) return;

  const prevEl = getStepEl(currentStep);
  const prevInd = getIndicatorEl(currentStep);
  if (prevEl) prevEl.classList.remove("active");
  if (prevInd) prevInd.classList.remove("active");

  currentStep = n;

  const nextEl = getStepEl(currentStep);
  const nextInd = getIndicatorEl(currentStep);
  if (nextEl) nextEl.classList.add("active");
  if (nextInd) nextInd.classList.add("active");

  const prevBtn = document.getElementById("prev-step");
  const nextBtn = document.getElementById("next-step");
  const downloadBtn = document.getElementById("download-combined");

  if (prevBtn) prevBtn.style.display = currentStep === 1 ? "none" : "";
  if (nextBtn) nextBtn.style.display = currentStep === 4 ? "none" : "";
  if (downloadBtn) downloadBtn.style.display = currentStep === 4 ? "" : "none";

  if (currentStep === 2) preFillStep2();
  if (currentStep === 4) renderSummary();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function collectStep1Data() {
  const data = {};
  for (const field of f1Config.fields) {
    if (field.type === "checkbox") {
      data[field.id] = getChecked(field.id);
    } else {
      data[field.id] = getValue(field.id);
    }
  }
  const tbody = document.getElementById("equip-tbody");
  if (tbody && f1Config.table) {
    const rows = tbody.querySelectorAll(`.${f1Config.table.rowClass}`);
    data.equipos = Array.from(rows).map((row) => {
      const rowData = {};
      for (const col of f1Config.table.columns) {
        rowData[col.key || col.name] =
          row.querySelector(`[name="${col.name}"]`)?.value ?? "";
      }
      return rowData;
    });
  }
  return data;
}

function collectStep2Data() {
  const data = {};
  for (const field of f2Config.fields) {
    if (field.type === "checkbox") {
      data[field.id] = getChecked(field.id);
    } else {
      data[field.id] = getValue(field.id);
    }
  }
  return data;
}

function getAllData() {
  return { ...collectStep1Data(), ...collectStep2Data() };
}

function renderSummary() {
  const allData = getAllData();
  const container = document.getElementById("summary-content");
  if (!container) return;

  container.innerHTML = `
    <div class="summary-section">
      <h3>F1 — Solicitud de Reserva y Préstamo de Equipos</h3>
      <table class="summary-table">
        <tr><td>Proyecto</td><td>${escHtml(allData.proyecto)}</td></tr>
        <tr><td>Asignatura</td><td>${escHtml(allData.asignatura)}</td></tr>
        <tr><td>Docente</td><td>${escHtml(allData.docente)}</td></tr>
        <tr><td>Responsable</td><td>${escHtml(allData.responsable)}</td></tr>
        <tr><td>Celular</td><td>${escHtml(allData.celular)}</td></tr>
        <tr><td>TIUN</td><td>${escHtml(allData.tiun)}</td></tr>
        <tr><td>Lugar</td><td>${escHtml(allData.lugar)}</td></tr>
        <tr><td>Tipo préstamo</td><td>${escHtml(allData["tipo-prestamo"])}</td></tr>
        <tr><td>Fecha retiro</td><td>${escHtml(allData["fecha-retiro"])}</td></tr>
        <tr><td>Fecha entrega</td><td>${escHtml(allData["fecha-entrega"] || "—")}</td></tr>
        <tr><td>Equipos</td><td>${(allData.equipos || []).length} equipo(s)</td></tr>
        <tr><td>Observaciones</td><td>${escHtml(allData.observaciones || "—")}</td></tr>
      </table>
    </div>
    <div class="summary-section">
      <h3>F2 — Acta de Compromiso</h3>
      <table class="summary-table">
        <tr><td>Nombre</td><td>${escHtml(allData.nombre)}</td></tr>
        <tr><td>Tipo doc.</td><td>${escHtml(allData["tipo-documento"])}</td></tr>
        <tr><td>Número doc.</td><td>${escHtml(allData["numero-documento"])}</td></tr>
        <tr><td>Contacto</td><td>${escHtml(allData.contacto)}</td></tr>
        <tr><td>Periodo inicial</td><td>${escHtml(allData["periodo-inicial"])}</td></tr>
        <tr><td>Periodo final</td><td>${escHtml(allData["periodo-final"])}</td></tr>
        <tr><td>Fecha constancia</td><td>${escHtml(allData["fecha-constancia"])}</td></tr>
        <tr><td>Firma</td><td>${allData["firma-nombre"] ? "Sí" : "No"}</td></tr>
      </table>
    </div>
    <div class="summary-section">
      <h3>Carnet</h3>
      <p>${carnetFile ? `Archivo adjunto: ${escHtml(carnetFile.name)}` : "No se adjuntó carnet"}</p>
    </div>
  `;
}

async function handleDownload() {
  const btn = document.getElementById("download-combined");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Generando PDF…";
  }

  try {
    const allData = getAllData();
    const combinedPdf = await generateCombinedPDF(allData, carnetFile);

    const blob = new Blob([combinedPdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = (allData["fecha-retiro"] || "").split("T")[0] || "sin-fecha";
    a.download = `solicitud_completa_${(allData.proyecto || "proyecto").replace(/\s+/g, "_")}_${date}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);

    window.EcytvUI.showSnackbar(
      "PDF combinado descargado correctamente.",
      "success",
    );
  } catch (err) {
    window.EcytvUI.showSnackbar(
      "Error al generar el PDF combinado: " + err.message,
      "error",
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Descargar PDF Combinado";
    }
  }
}

function initSameDayCheckbox() {
  const flagCheckbox = document.getElementById("mismo-dia");
  const sourceInput = document.getElementById("fecha-retiro");
  const targetInput = document.getElementById("fecha-entrega");
  if (!flagCheckbox || !sourceInput || !targetInput) return;

  flagCheckbox.addEventListener("change", () => {
    if (flagCheckbox.checked && sourceInput.value) {
      targetInput.value = sourceInput.value;
      targetInput.disabled = true;
    } else {
      targetInput.disabled = false;
    }
  });

  sourceInput.addEventListener("input", () => {
    if (flagCheckbox.checked && sourceInput.value) {
      targetInput.value = sourceInput.value;
    }
  });
}

function initCarnetUpload() {
  const dropZone = document.getElementById("carnet-drop-zone");
  const fileInput = document.getElementById("carnet-input");
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });
}

function handleFile(file) {
  const validTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    window.EcytvUI.showSnackbar(
      "Formato no válido. Sube una imagen (JPG/PNG) o PDF.",
      "warning",
    );
    return;
  }

  carnetFile = file;
  const status = document.getElementById("carnet-status");
  if (status)
    status.textContent = `Archivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const previewEl = document.getElementById("carnet-preview");
  if (previewEl) {
    if (file.type === "application/pdf") {
      previewEl.innerHTML = `<span class="carnet-pdf-icon">📄 ${file.name}</span>`;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewEl.innerHTML = `<img src="${e.target.result}" alt="Vista previa del carnet" class="carnet-img">`;
      };
      reader.readAsDataURL(file);
    }
  }
}

function initBackLink() {
  const link = document.getElementById("back-link");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./#formats";
    });
  }
}

initBackLink();
initSameDayCheckbox();
initTable(f1Config.table);
initCarnetUpload();

const prevBtn = document.getElementById("prev-step");
const nextBtn = document.getElementById("next-step");
const downloadBtn = document.getElementById("download-combined");

if (prevBtn) {
  prevBtn.addEventListener("click", () => goToStep(currentStep - 1));
}
if (nextBtn) {
  nextBtn.addEventListener("click", () => goToStep(currentStep + 1));
}
if (downloadBtn) {
  downloadBtn.addEventListener("click", handleDownload);
}

document.querySelectorAll(".step-indicator .step").forEach((el) => {
  el.addEventListener("click", () => {
    const target = parseInt(el.dataset.step, 10);
    if (target < currentStep) goToStep(target);
  });
});

goToStep(1);
