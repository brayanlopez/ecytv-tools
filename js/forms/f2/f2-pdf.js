import { buildFilename } from "../common/filename.js";

function formatDateParts(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("es-CO", { month: "long" }),
    year: d.getFullYear(),
  };
}

export async function generateF2PDF(data) {
  if (!window.PDFLib) {
    window.EcytvUI.showSnackbar(
      "Error al cargar la librería PDF. Verifica tu conexión a internet.",
      "error",
    );
    return;
  }

  try {
    const resp = await fetch("data/f2-template.pdf");
    if (!resp.ok) throw new Error("No se pudo cargar la plantilla PDF");
    const templateBytes = await resp.arrayBuffer();

    const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
    const doc = await PDFDocument.load(templateBytes);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const pages = doc.getPages();
    const page = pages[0];

    const black = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);

    function drawText(text, x, y, size = 11, opts = {}) {
      if (text == null || text === "") return;
      page.drawText(String(text), {
        x,
        y,
        size,
        font: opts.bold ? fontBold : font,
        color: opts.color || black,
      });
    }

    function fillBlank(x, y, text, maxWidth, size = 11) {
      if (!text) return;
      const tw = font.widthOfTextAtSize(text, size);
      if (tw < maxWidth) {
        const centerX = x + (maxWidth - tw) / 2;
        drawText(text, centerX, y, size);
      } else {
        const scale = maxWidth / tw;
        drawText(text, x, y, size * scale);
      }
    }

    const H = 843;

    const {
      nombre,
      "tipo-documento": tipoDoc,
      "numero-documento": numDoc,
      "periodo-inicial": periodoInicial,
      "periodo-final": periodoFinal,
      "fecha-constancia": fechaConstancia,
      "firma-nombre": firma,
      contacto,
      observaciones,
    } = data;

    const name = (nombre || "").trim();
    const docNum = (numDoc || "").trim();
    const contactVal = (contacto || "").trim();

    // ---- Name: "Yo, ________________" blank at x=95-342, y=301-315 from top ----
    if (name) {
      const blankStart = 95;
      const blankWidth = 342 - 95;
      fillBlank(blankStart, H - 309, name, blankWidth, 10);
    }

    // ---- Document type: template says "con cédula de ciudadanía número ______" ----
    // "ciudadanía" at x=72-133, y=326-340 from top
    // number blank at x=188-348, y=326-340
    const docTypeMap = {
      CC: "Cédula de Ciudadanía",
      CE: "Cédula de Extranjería",
      TI: "Tarjeta de Identidad",
      PA: "Pasaporte",
      NIT: "NIT",
    };

    if (tipoDoc && tipoDoc !== "CC") {
      const fullType = docTypeMap[tipoDoc] || tipoDoc;
      // cover "ciudadanía" with white
      page.drawRectangle({
        x: 72,
        y: H - 340,
        width: 133 - 72,
        height: 340 - 326,
        color: white,
      });
      drawText(fullType, 72, H - 334, 9);
    }

    if (docNum) {
      const numBlankStart = 188;
      const numBlankWidth = 348 - 188;
      fillBlank(numBlankStart, H - 334, docNum, numBlankWidth, 10);
    }

    // ---- Period dates ----
    // start: día blank x=274.82-302.72, month blank x=332.66-360.56, year blank x=388.31-430.16
    // end:   day blank x=72.06-99.96, month blank x=129.92-157.82, year blank x=185.60-230.99
    const periodStart = formatDateParts(periodoInicial);
    const periodEnd = formatDateParts(periodoFinal);

    if (periodStart) {
      fillBlank(274.82, H - 487, String(periodStart.day), 27.9, 9);
      fillBlank(332.66, H - 487, periodStart.month, 27.9, 7);
      fillBlank(388.31, H - 487, String(periodStart.year), 41.85, 9);
    }
    if (periodEnd) {
      fillBlank(72.06, H - 511, String(periodEnd.day), 27.9, 9);
      fillBlank(129.92, H - 511, periodEnd.month, 27.9, 7);
      fillBlank(185.6, H - 511, String(periodEnd.year), 45.39, 9);
    }

    // ---- Constancia date ----
    // "Se hace constancia el día _____ del mes __________ del año _______."
    // day blank x=216.45-251.32, month blank x=301.99-371.74, year blank x=420.22-472.58
    const constancia = formatDateParts(fechaConstancia);
    if (constancia) {
      fillBlank(216.45, H - 589, String(constancia.day), 34.87, 9);
      fillBlank(301.99, H - 589, constancia.month, 69.75, 9);
      fillBlank(420.22, H - 589, String(constancia.year), 52.36, 9);
    }

    // ---- Signature ----
    // signature line at x=72-260, y≈690 from top
    // "Firma del Directo Responsable" at y≈716
    if (firma && name) {
      const lineWidth = 260 - 72;
      const tw = font.widthOfTextAtSize(name, 10);
      const centerX = 72 + (lineWidth - tw) / 2;
      drawText(name, centerX, H - 688, 10);
    }

    // ---- Contact ----
    // "Número de contacto:" at x=72-193, y=734-748 from top
    if (contactVal) {
      drawText(contactVal, 196, H - 742, 10);
    } else {
      drawText("(sin especificar)", 196, H - 742, 9, {
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      buildFilename({ formId: "f2", project: "acta", username: nombre, date: fechaConstancia }) +
      ".pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    window.EcytvUI.showSnackbar("Error al generar el archivo PDF: " + err.message, "error");
  }
}
