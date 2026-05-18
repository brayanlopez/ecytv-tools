export function generateF4PDF(data) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    window.EcytvUI.showSnackbar(
      "Error al cargar la librería PDF. Verifica tu conexión a internet.",
      "error",
    );
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const {
    proyecto,
    asignatura,
    docente,
    "directo-responsable": directoResponsable,
    "tipo-documento": tipoDoc,
    "numero-documento": numDoc,
    tiun,
    observaciones,
    salas: salaRows = [],
  } = data;

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
  doc.text("Solicitud de Reserva y Prestamo", 105, 12, { align: "center" });
  doc.text("Salas de Edicion", 105, 20, { align: "center" });

  let yPos = 36;

  yPos = sectionHeader("1. INFORMACION DEL PROYECTO", yPos);
  yPos = fieldRow("Nombre del proyecto", proyecto, yPos);
  yPos = fieldRow("Asignatura", asignatura, yPos);
  yPos = fieldRow("Docente que autoriza", docente, yPos);
  yPos += 4;

  yPos = sectionHeader("2. DATOS DEL DIRECTO RESPONSABLE", yPos);
  yPos = fieldRow("Directo responsable", directoResponsable, yPos);
  yPos = fieldRow("Documento", (tipoDoc ? tipoDoc + ". " : "") + (numDoc || ""), yPos);
  yPos = fieldRow("TIUN", tiun, yPos);
  yPos += 4;

  yPos = sectionHeader("3. SALAS DE EDICION", yPos);

  if (salaRows.length > 0) {
    doc.autoTable({
      startY: yPos,
      head: [["Sala", "Fecha", "Hora inicio", "Hora fin"]],
      body: salaRows.map((r) => [r.nombre, r.fecha, r["hora-inicio"], r["hora-fin"]]),
      theme: "grid",
      headStyles: { fillColor: primary, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 2, lineColor: borderGray },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });
    yPos = doc.lastAutoTable.finalY + 6;
  } else {
    yPos = fieldRow("Salas", "(ninguna)", yPos);
    yPos += 4;
  }

  yPos = sectionHeader("4. OBSERVACIONES", yPos);
  doc.setTextColor("#222222");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const obsText = observaciones || "(sin observaciones)";
  const lines = doc.splitTextToSize(obsText, 178);
  doc.text(lines, 16, yPos + 3);

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

  doc.save("F4-Solicitud-Salas-Edicion.pdf");
}
