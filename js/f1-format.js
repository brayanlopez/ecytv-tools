document.addEventListener("DOMContentLoaded", () => {
  // Theme
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Back link
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

  // Same-day checkbox
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

  // Add equipment row
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

  // Remove existing rows
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove-equip");
    if (btn) {
      const row = btn.closest(".equip-row");
      if (tbody.children.length > 1) row.remove();
    }
  });

  // Reset handler
  form.addEventListener("reset", () => {
    setTimeout(() => {
      const rows = tbody.querySelectorAll(".equip-row");
      for (let i = rows.length - 1; i > 0; i--) {
        rows[i].remove();
      }
      const firstRow = tbody.querySelector(".equip-row");
      if (firstRow) {
        firstRow.querySelectorAll("input").forEach((inp) => (inp.value = ""));
      }
      fechaEntrega.disabled = false;
    }, 0);
  });

  // Submit handler — generate PDF
  form.addEventListener("submit", (e) => {
    e.preventDefault();

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

    if (!valid) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const primary = "#019587";
    const lightGray = "#f5f5f5";
    const borderGray = "#dddddd";

    function sectionHeader(text, y) {
      doc.setFillColor(primary);
      doc.rect(14, y, 182, 8, "F");
      doc.setTextColor("#ffffff");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(text, 16, y + 5.5);
      return y + 12;
    }

    function fieldRow(label, value, y) {
      doc.setFillColor(lightGray);
      doc.rect(14, y, 60, 7, "F");
      doc.setTextColor("#555555");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(label, 16, y + 5);
      doc.setTextColor("#222222");
      doc.setFont("helvetica", "normal");
      doc.text(value || "(sin especificar)", 78, y + 5);
      return y + 9;
    }

    // Title
    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Solicitud de Reserva y Prestamo de Equipos", 105, 12, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Formato F1", 105, 20, { align: "center" });

    let yPos = 36;

    // 1. Información del Proyecto
    yPos = sectionHeader("1. INFORMACION DEL PROYECTO", yPos);
    yPos = fieldRow(
      "Nombre del proyecto",
      document.getElementById("proyecto").value,
      yPos,
    );
    yPos = fieldRow(
      "Asignatura",
      document.getElementById("asignatura").value,
      yPos,
    );
    yPos = fieldRow(
      "Docente que autoriza",
      document.getElementById("docente").value,
      yPos,
    );
    yPos += 4;

    // 2. Datos del Responsable
    yPos = sectionHeader("2. DATOS DEL RESPONSABLE", yPos);
    yPos = fieldRow(
      "Nombre del responsable",
      document.getElementById("responsable").value,
      yPos,
    );
    yPos = fieldRow("Celular", document.getElementById("celular").value, yPos);
    yPos = fieldRow(
      "Tipo de documento",
      document.getElementById("tipo-documento").value,
      yPos,
    );
    yPos = fieldRow("TIUN", document.getElementById("tiun").value, yPos);
    yPos += 4;

    // 3. Información del Préstamo
    yPos = sectionHeader("3. INFORMACION DEL PRESTAMO", yPos);
    yPos = fieldRow(
      "Lugar de grabacion",
      document.getElementById("lugar").value,
      yPos,
    );
    yPos = fieldRow(
      "Tipo de prestamo",
      document.getElementById("tipo-prestamo").value,
      yPos,
    );
    yPos = fieldRow(
      "Fecha y hora de retiro",
      document.getElementById("fecha-retiro").value.replace("T", " "),
      yPos,
    );
    yPos = fieldRow(
      "Fecha y hora de entrega",
      document.getElementById("fecha-entrega").value.replace("T", " "),
      yPos,
    );
    yPos += 4;

    // 4. Equipos a Solicitar
    yPos = sectionHeader("4. EQUIPOS A SOLICITAR", yPos);

    const equipRows = Array.from(tbody.querySelectorAll(".equip-row")).map(
      (row) => [
        row.querySelector('input[name="equipo-item"]').value || "",
        row.querySelector('input[name="equipo-nombre"]').value || "",
        row.querySelector('input[name="equipo-consecutivo"]').value || "",
      ],
    );

    if (equipRows.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [["Item", "Equipo", "Consecutivo Vigente"]],
        body: equipRows,
        theme: "grid",
        headStyles: { fillColor: primary, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        styles: { cellPadding: 2, lineColor: borderGray },
        margin: { left: 14, right: 14 },
        tableWidth: 182,
      });
      yPos = doc.lastAutoTable.finalY + 6;
    } else {
      yPos = fieldRow("Equipos", "(ninguno)", yPos);
      yPos += 4;
    }

    // 5. Observaciones
    yPos = sectionHeader("5. OBSERVACIONES", yPos);
    doc.setTextColor("#222222");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const obs =
      document.getElementById("observaciones").value || "(sin observaciones)";
    const lines = doc.splitTextToSize(obs, 178);
    doc.text(lines, 16, yPos + 3);
    yPos = yPos + 3 + lines.length * 4 + 6;

    // Footer
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
    doc.text("Documento generado el " + dateStr, 105, 288, {
      align: "center",
    });

    // Download
    doc.save("F1-Solicitud-Prestamo-Equipos.pdf");
  });
});
