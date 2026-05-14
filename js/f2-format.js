document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

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

  function validate() {
    const required = form.querySelectorAll("[required]");
    let valid = true;
    required.forEach((el) => {
      if (!el.value.trim()) {
        el.style.borderColor = "#e63946";
        valid = false;
      } else {
        el.style.borderColor = "";
      }
    });
    if (!valid)
      window.EcytvUI.showSnackbar(
        "Por favor completa todos los campos obligatorios.",
        "warning",
      );
    return valid;
  }

  document.getElementById("btn-pdf").addEventListener("click", generatePDF);
  document.getElementById("btn-save").addEventListener("click", saveToHistory);

  loadHistory();

  function collectFormData() {
    return {
      nombre: document.getElementById("nombre").value,
      "tipo-documento": document.getElementById("tipo-documento").value,
      "numero-documento": document.getElementById("numero-documento").value,
      contacto: document.getElementById("contacto").value,
      "periodo-inicial": document.getElementById("periodo-inicial").value,
      "periodo-final": document.getElementById("periodo-final").value,
      "fecha-constancia": document.getElementById("fecha-constancia").value,
      "firma-nombre": document.getElementById("firma-nombre").checked,
      observaciones: document.getElementById("observaciones").value,
    };
  }

  function saveToHistory() {
    const data = collectFormData();
    if (!data.nombre.trim()) {
      window.EcytvUI.showSnackbar(
        "Completa al menos el nombre antes de guardar.",
        "warning",
      );
      return;
    }
    const history = JSON.parse(localStorage.getItem("f2-history") || "[]");
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      savedAt: new Date().toISOString(),
      data,
    };
    history.unshift(entry);
    if (history.length > 20) history.length = 20;
    localStorage.setItem("f2-history", JSON.stringify(history));
    renderHistory(history);
    window.EcytvUI.showSnackbar("Acta guardada en el historial.", "success");
  }

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem("f2-history") || "[]");
    renderHistory(history);
  }

  function renderHistory(history) {
    const card = document.getElementById("history-card");
    const list = document.getElementById("history-list");
    if (!history.length) {
      card.style.display = "none";
      return;
    }
    card.style.display = "";
    list.innerHTML = history
      .map((entry) => {
        const d = new Date(entry.savedAt);
        const dateStr = d.toLocaleDateString("es-CO", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const title = entry.data.nombre || "(sin nombre)";
        return `<div class="history-entry">
          <div class="history-entry-info">
            <div class="history-entry-title">${escHtml(title)}</div>
            <div class="history-entry-meta">${escHtml(dateStr)}</div>
          </div>
          <div class="history-entry-actions">
            <button type="button" class="btn-history-restore" data-id="${entry.id}">Restaurar</button>
            <button type="button" class="btn-history-delete" data-id="${entry.id}">Eliminar</button>
          </div>
        </div>`;
      })
      .join("");

    list.querySelectorAll(".btn-history-restore").forEach((btn) => {
      btn.addEventListener("click", () => restoreFromHistory(btn.dataset.id));
    });
    list.querySelectorAll(".btn-history-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteFromHistory(btn.dataset.id));
    });
  }

  function escHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function restoreFromHistory(id) {
    const history = JSON.parse(localStorage.getItem("f2-history") || "[]");
    const entry = history.find((e) => e.id === id);
    if (!entry) return;

    const d = entry.data;
    document.getElementById("nombre").value = d.nombre || "";
    document.getElementById("tipo-documento").value = d["tipo-documento"] || "";
    document.getElementById("numero-documento").value =
      d["numero-documento"] || "";
    document.getElementById("contacto").value = d.contacto || "";
    document.getElementById("periodo-inicial").value =
      d["periodo-inicial"] || "";
    document.getElementById("periodo-final").value = d["periodo-final"] || "";
    document.getElementById("fecha-constancia").value =
      d["fecha-constancia"] || "";
    document.getElementById("firma-nombre").checked =
      d["firma-nombre"] || false;
    document.getElementById("observaciones").value = d.observaciones || "";

    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteFromHistory(id) {
    let history = JSON.parse(localStorage.getItem("f2-history") || "[]");
    history = history.filter((e) => e.id !== id);
    localStorage.setItem("f2-history", JSON.stringify(history));
    renderHistory(history);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function generatePDF() {
    if (!validate()) return;
    saveToHistory();

    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.EcytvUI.showSnackbar(
        "Error al cargar la librería PDF. Verifica tu conexión a internet.",
        "error",
      );
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const primary = "#019587";
    const dark = "#01415b";

    // Header
    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ACTA DE COMPROMISO", 105, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Formato F2", 105, 20, { align: "center" });

    let yPos = 40;

    // Body text
    const nombre = document.getElementById("nombre").value;
    const tipoDoc = document.getElementById("tipo-documento").value;
    const numDoc = document.getElementById("numero-documento").value;
    const periodoInicial = document.getElementById("periodo-inicial").value;
    const periodoFinal = document.getElementById("periodo-final").value;
    const fechaConstancia = document.getElementById("fecha-constancia").value;
    const firma = document.getElementById("firma-nombre").checked;
    const contacto = document.getElementById("contacto").value;
    const observaciones = document.getElementById("observaciones").value;

    doc.setTextColor("#222222");
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const docId = tipoDoc ? tipoDoc + ". " + (numDoc || "") : numDoc || "";
    const bodyText = `Yo, ${nombre}, identificado(a) con ${docId}, me hago responsable de los equipos que retiro del Laboratorio de Instrumentos de Produccion Audiovisual de la Escuela de Cine y Television. Asi mismo, me hago responsable de cualquier dano fisico, tecnico o perdida que pueda suceder durante la manipulacion de los equipos.`;

    const bodyLines = doc.splitTextToSize(bodyText, 178);
    doc.text(bodyLines, 16, yPos);
    yPos += bodyLines.length * 6 + 8;

    // Period
    doc.setFont("helvetica", "bold");
    doc.text("Periodo del prestamo:", 16, yPos);
    doc.setFont("helvetica", "normal");
    const periodText = `El periodo de prestamo inicia ${formatDate(periodoInicial)} y finaliza ${formatDate(periodoFinal)}.`;
    doc.text(periodText, 16, yPos + 7);
    yPos += 16;

    // Constancia
    doc.setFont("helvetica", "bold");
    doc.text("Fecha de constancia:", 16, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Se hace constancia el dia ${formatDate(fechaConstancia)}.`,
      16,
      yPos + 7,
    );
    yPos += 16;

    // Firma
    doc.setFont("helvetica", "bold");
    doc.text("Firma del directo responsable:", 16, yPos);
    if (firma) {
      doc.setFont("helvetica", "italic");
      doc.text(nombre, 16, yPos + 10);
      doc.line(16, yPos + 8, 100, yPos + 8);
    } else {
      doc.line(16, yPos + 8, 100, yPos + 8);
    }
    yPos += 16;

    // Contacto
    doc.setFont("helvetica", "bold");
    doc.text("Numero de contacto:", 16, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(contacto || "(sin especificar)", 60, yPos);
    yPos += 12;

    // Observaciones
    if (observaciones.trim()) {
      doc.setFont("helvetica", "bold");
      doc.text("Observaciones:", 16, yPos);
      doc.setFont("helvetica", "normal");
      const obsLines = doc.splitTextToSize(observaciones, 178);
      doc.text(obsLines, 16, yPos + 7);
      yPos += obsLines.length * 6 + 10;
    }

    // Footer
    yPos = Math.max(yPos, 260);
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.setFontSize(7);
    doc.setTextColor("#999999");
    doc.text("Documento generado el " + dateStr, 105, 288, { align: "center" });

    doc.save("F2-Acta-Compromiso.pdf");
  }
});
