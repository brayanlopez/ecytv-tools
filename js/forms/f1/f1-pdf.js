export function generateF1PDF(getEquipData) {
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

  yPos = sectionHeader("2. DATOS DEL RESPONSABLE", yPos);
  yPos = fieldRow(
    "Nombre del responsable",
    document.getElementById("responsable").value,
    yPos,
  );
  yPos = fieldRow("Celular", document.getElementById("celular").value, yPos);
  yPos = fieldRow("TIUN", document.getElementById("tiun").value, yPos);
  yPos += 4;

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

  yPos = sectionHeader("4. EQUIPOS A SOLICITAR", yPos);

  const equipRows = getEquipData();
  if (equipRows.length > 0) {
    doc.autoTable({
      startY: yPos,
      head: [["Item", "Equipo", "Consecutivo Vigente"]],
      body: equipRows.map((r) => [r.item, r.nombre, r.consecutivo]),
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

  yPos = sectionHeader("5. OBSERVACIONES", yPos);
  doc.setTextColor("#222222");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const obs =
    document.getElementById("observaciones").value || "(sin observaciones)";
  const lines = doc.splitTextToSize(obs, 178);
  doc.text(lines, 16, yPos + 3);
  yPos = yPos + 3 + lines.length * 4 + 6;

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

  doc.save("F1-Solicitud-Prestamo-Equipos.pdf");
}
