import { htmlToPdf } from "./html-to-pdf.js";

export async function generatePDF(buildTemplate, getExportFilename, formData) {
  try {
    const html = buildTemplate(formData);
    const doc = await htmlToPdf(html);
    doc.save(getExportFilename(formData) + ".pdf");
  } catch (err) {
    window.EcytvUI.showSnackbar("Error al generar el archivo PDF: " + err.message, "error");
  }
}
