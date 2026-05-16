function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateF2PDF() {
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

  doc.setFont("helvetica", "bold");
  doc.text("Periodo del prestamo:", 16, yPos);
  doc.setFont("helvetica", "normal");
  const periodText = `El periodo de prestamo inicia ${formatDate(periodoInicial)} y finaliza ${formatDate(periodoFinal)}.`;
  doc.text(periodText, 16, yPos + 7);
  yPos += 16;

  doc.setFont("helvetica", "bold");
  doc.text("Fecha de constancia:", 16, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Se hace constancia el dia ${formatDate(fechaConstancia)}.`,
    16,
    yPos + 7,
  );
  yPos += 16;

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

  doc.setFont("helvetica", "bold");
  doc.text("Numero de contacto:", 16, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(contacto || "(sin especificar)", 60, yPos);
  yPos += 12;

  if (observaciones.trim()) {
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", 16, yPos);
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(observaciones, 178);
    doc.text(obsLines, 16, yPos + 7);
    yPos += obsLines.length * 6 + 10;
  }

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
