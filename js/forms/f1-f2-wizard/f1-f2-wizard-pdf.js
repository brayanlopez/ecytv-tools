import { buildF1Template } from "../f1/f1-template.js";
import { buildF2Template } from "../f2/f2-template.js";
import { htmlToPdf } from "../common/html-to-pdf.js";

function collectF1Data(allData) {
  return {
    proyecto: allData.proyecto,
    asignatura: allData.asignatura,
    docente: allData.docente,
    responsable: allData.responsable,
    celular: allData.celular,
    tiun: allData.tiun,
    lugar: allData.lugar,
    "tipo-prestamo": allData["tipo-prestamo"],
    "fecha-retiro": allData["fecha-retiro"],
    "fecha-entrega": allData["fecha-entrega"],
    "mismo-dia": allData["mismo-dia"],
    observaciones: allData.observaciones,
    equipos: allData.equipos || [],
  };
}

function collectF2Data(allData) {
  return {
    nombre: allData.nombre,
    "tipo-documento": allData["tipo-documento"],
    "numero-documento": allData["numero-documento"],
    contacto: allData.contacto,
    "periodo-inicial": allData["periodo-inicial"],
    "periodo-final": allData["periodo-final"],
    "fecha-constancia": allData["fecha-constancia"],
    "firma-nombre": allData["firma-nombre"],
    observaciones: allData.observaciones,
  };
}

async function imageToPdfBytes(imageFile) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(imageFile);
  });

  const img = await new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.src = dataUrl;
  });

  const imgRatio = img.width / img.height;
  const pageRatio = pageWidth / pageHeight;

  let renderW, renderH;
  if (imgRatio > pageRatio) {
    renderW = pageWidth - 20;
    renderH = renderW / imgRatio;
  } else {
    renderH = pageHeight - 20;
    renderW = renderH * imgRatio;
  }

  const x = (pageWidth - renderW) / 2;
  const y = (pageHeight - renderH) / 2;

  doc.addImage(dataUrl, imageFile.type === "image/png" ? "PNG" : "JPEG", x, y, renderW, renderH);
  return doc.output("arraybuffer");
}

async function generatePDFBytes(buildTemplate, data) {
  const doc = await htmlToPdf(buildTemplate(data));
  return doc.output("arraybuffer");
}

export async function generateCombinedPDF(allData, carnetFile) {
  const f1Bytes = await generatePDFBytes(buildF1Template, collectF1Data(allData));
  const f2Bytes = await generatePDFBytes(buildF2Template, collectF2Data(allData));

  const { PDFDocument } = window.PDFLib;
  const mergedDoc = await PDFDocument.create();

  const f1Doc = await PDFDocument.load(f1Bytes);
  const f1Pages = await mergedDoc.copyPages(f1Doc, f1Doc.getPageIndices());
  f1Pages.forEach((p) => mergedDoc.addPage(p));

  const f2Doc = await PDFDocument.load(f2Bytes);
  const f2Pages = await mergedDoc.copyPages(f2Doc, f2Doc.getPageIndices());
  f2Pages.forEach((p) => mergedDoc.addPage(p));

  if (carnetFile) {
    if (carnetFile.type === "application/pdf") {
      const carnetBuf = await carnetFile.arrayBuffer();
      const carnetDoc = await PDFDocument.load(carnetBuf);
      const carnetPages = await mergedDoc.copyPages(carnetDoc, carnetDoc.getPageIndices());
      carnetPages.forEach((p) => mergedDoc.addPage(p));
    } else {
      const carnetPdfBytes = await imageToPdfBytes(carnetFile);
      const carnetDoc = await PDFDocument.load(carnetPdfBytes);
      const carnetPages = await mergedDoc.copyPages(carnetDoc, carnetDoc.getPageIndices());
      carnetPages.forEach((p) => mergedDoc.addPage(p));
    }
  }

  return mergedDoc.save();
}
