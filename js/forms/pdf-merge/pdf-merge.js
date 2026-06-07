import { buildFilename } from "../common/filename.js";

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const fileListEl = document.getElementById("file-list");
const mergeBtn = document.getElementById("btn-merge");
const downloadSection = document.getElementById("download-section");
const downloadBtn = document.getElementById("btn-download-merged");
const emptyMsg = document.getElementById("file-list-empty");

const files = [];

function formatSize(bytes) {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + " KB";
  }
  return (bytes / 1048576).toFixed(1) + " MB";
}

function showStatus(message, type = "info") {
  if (window.EcytvUI) {
    window.EcytvUI.showSnackbar(message, type);
  }
}

function renderFileList() {
  fileListEl.innerHTML = "";

  if (files.length === 0) {
    emptyMsg.style.display = "block";
    fileListEl.appendChild(emptyMsg);
  } else {
    emptyMsg.style.display = "none";
  }

  files.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "merge-file-item";
    item.draggable = true;
    item.dataset.index = index;

    item.innerHTML = `
      <div class="merge-file-drag" aria-label="Arrastrar para reordenar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
          <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/>
        </svg>
      </div>
      <div class="merge-file-info">
        <span class="merge-file-name">${file.name}</span>
        <span class="merge-file-meta">${formatSize(file.size)}${file.pageCount !== undefined ? ` · ${file.pageCount} pág.` : ""}</span>
      </div>
      <button type="button" class="merge-file-remove" data-index="${index}" aria-label="Eliminar ${file.name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    const removeBtn = item.querySelector(".merge-file-remove");
    removeBtn.addEventListener("click", () => {
      files.splice(index, 1);
      renderFileList();
      updateMergeBtn();
    });

    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index);
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const target = e.currentTarget;
      if (target !== item) {
        return;
      }
      target.classList.toggle("drag-over", true);
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      const toIndex = index;
      if (fromIndex === toIndex) {
        return;
      }
      const [moved] = files.splice(fromIndex, 1);
      files.splice(toIndex, 0, moved);
      renderFileList();
      updateMergeBtn();
    });

    fileListEl.appendChild(item);
  });
}

function updateMergeBtn() {
  mergeBtn.disabled = files.length < 2;
}

async function getPageCount(buffer) {
  try {
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.load(buffer);
    return doc.getPageCount();
  } catch {
    return null;
  }
}

async function addFiles(newFiles) {
  for (const file of newFiles) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showStatus(`"${file.name}" no es un archivo PDF`, "warning");
      continue;
    }
    const buffer = await file.arrayBuffer();
    const pageCount = await getPageCount(buffer);
    files.push({ name: file.name, size: file.size, buffer, pageCount });
  }
  renderFileList();
  updateMergeBtn();
}

function initDropZone() {
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
    addFiles(Array.from(e.dataTransfer.files));
  });

  fileInput.addEventListener("change", () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = "";
  });
}

async function handleMerge() {
  if (files.length < 2) {
    return;
  }

  mergeBtn.disabled = true;
  mergeBtn.textContent = "Fusionando…";

  try {
    const { PDFDocument } = window.PDFLib;
    const mergedDoc = await PDFDocument.create();

    for (const file of files) {
      const srcDoc = await PDFDocument.load(file.buffer);
      const indices = srcDoc.getPageIndices();
      const pages = await mergedDoc.copyPages(srcDoc, indices);
      pages.forEach((page) => mergedDoc.addPage(page));
    }

    const pdfBytes = await mergedDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    downloadBtn.href = url;

    const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);
    downloadBtn.download = `${buildFilename({ formId: "fusion", project: "pdfs", username: "merged", date: new Date().toISOString().split("T")[0] })}.pdf`;

    downloadSection.style.display = "block";
    downloadSection.querySelector(".merge-result-info").textContent =
      `PDF fusionado correctamente — ${totalPages} páginas en total`;

    showStatus("PDFs fusionados correctamente", "success");
  } catch (err) {
    showStatus("Error al fusionar PDFs: " + err.message, "error");
  } finally {
    mergeBtn.disabled = false;
    mergeBtn.textContent = "Fusionar PDFs";
  }
}

function init() {
  if (!dropZone || !fileInput || !fileListEl || !mergeBtn || !downloadSection || !downloadBtn) {
    return;
  }

  const backLink = document.getElementById("back-link");
  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./#formats";
    });
  }

  if (!window.PDFLib) {
    showStatus("Error al cargar la librería PDF. Verifica tu conexión a internet.", "error");
    mergeBtn.disabled = true;
    return;
  }

  initDropZone();
  mergeBtn.addEventListener("click", handleMerge);
  updateMergeBtn();
}

document.addEventListener("DOMContentLoaded", init);
