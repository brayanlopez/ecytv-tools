/* global html2canvas */

const PDF_MARGIN_MM = 10;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const USABLE_WIDTH_MM = PAGE_WIDTH_MM - PDF_MARGIN_MM * 2;
const USABLE_HEIGHT_MM = PAGE_HEIGHT_MM - PDF_MARGIN_MM * 2;

export async function htmlToPdf(htmlString) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("La librería jsPDF no está disponible.");
  }
  if (typeof html2canvas === "undefined") {
    throw new Error("La librería html2canvas no está disponible.");
  }

  const container = document.createElement("div");
  container.style.cssText = "position:absolute;left:-9999px;top:0;width:1000px;";
  container.innerHTML = htmlString;
  document.body.appendChild(container);

  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 50));

  const scale = 2;
  const canvas = await html2canvas(container, {
    scale,
    useCORS: true,
    logging: false,
    width: container.scrollWidth,
    height: container.scrollHeight,
  });

  document.body.removeChild(container);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const cW = canvas.width;
  const cH = canvas.height;

  const totalImgH_mm = (cH / cW) * USABLE_WIDTH_MM;

  if (totalImgH_mm <= USABLE_HEIGHT_MM * 1.05) {
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", PDF_MARGIN_MM, PDF_MARGIN_MM, USABLE_WIDTH_MM, totalImgH_mm);
    return doc;
  }

  const fitScale = USABLE_HEIGHT_MM / totalImgH_mm;
  const fitW_mm = USABLE_WIDTH_MM * fitScale;
  const offsetX_mm = PDF_MARGIN_MM + (USABLE_WIDTH_MM - fitW_mm) / 2;
  const imgData = canvas.toDataURL("image/png");
  doc.addImage(imgData, "PNG", offsetX_mm, PDF_MARGIN_MM, fitW_mm, USABLE_HEIGHT_MM);

  return doc;
}
