import { escHtml } from "../common/esc-html.js";

function formatDateParts(dateStr) {
  if (!dateStr) {
    return { day: "", month: "", year: "" };
  }
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("es-CO", { month: "long" }),
    year: d.getFullYear(),
  };
}

export function buildF2Template(data) {
  const {
    nombre = "",
    "tipo-documento": tipoDoc = "",
    "numero-documento": numDoc = "",
    contacto = "",
    "periodo-inicial": periodoInicial = "",
    "periodo-final": periodoFinal = "",
    "fecha-constancia": fechaConstancia = "",
    "firma-nombre": firma = false,
  } = data;

  const docTypeMap = {
    CC: "Cédula de Ciudadanía",
    CE: "Cédula de Extranjería",
    TI: "Tarjeta de Identidad",
    PA: "Pasaporte",
    NIT: "NIT",
  };

  const docTypeLabel = docTypeMap[tipoDoc] || tipoDoc || "Cédula de Ciudadanía";
  const periodStart = formatDateParts(periodoInicial);
  const periodEnd = formatDateParts(periodoFinal);
  const constancia = formatDateParts(fechaConstancia);

  function periodDateHtml(parts) {
    if (parts.day) {
      return `d\u00eda ${parts.day} de ${parts.month} de ${parts.year}`;
    }
    return `d\u00eda <span class="blank">____</span> mes <span class="blank">____</span> a\u00f1o <span class="blank">______</span>`;
  }

  function constanciaHtml(parts) {
    if (parts.day) {
      return `${parts.day} de ${parts.month} de ${parts.year}`;
    }
    return `d\u00eda <span class="blank">_____</span> del mes <span class="blank">__________</span> del a\u00f1o <span class="blank">_______</span>`;
  }

  return `<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #fff;
    font-family: Calibri, "Arial Narrow", Arial, Helvetica, sans-serif;
    color: #000;
  }
  .sheet {
    width: 894px;
    min-height: 1264px;
    margin: 0 auto;
    padding: 100px 40px;
  }
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 80px;
  }
  .f2-badge {
    font-family: Arial, sans-serif;
    font-weight: 700;
    font-size: 120px;
    line-height: 1;
  }
  .uni {
    display: flex;
    gap: 16px;
    align-items: center;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 18px;
    text-align: right;
  }
  .uni-left {
  }
  .uni-divider {
    width: 1.5px;
    height: 120px;
    background: #000;
    flex-shrink: 0;
  }
  .uni-logo {
    height: 140px;
    width: auto;
    flex-shrink: 0;
  }
  .title {
    text-align: center;
    margin-top: 150px;
    margin-bottom: 80px;
  }
  .title h1 {
    font-family: Calibri, "Arial Narrow", Arial, sans-serif;
    font-size: 48px;
    font-weight: 700;
    margin: 0;
  }
  .declaration {
    font-size: 26px;
    line-height: 1.8;
    margin-bottom: 48px;
    text-align: justify;
  }
  .blank {
    display: inline-block;
    border-bottom: 1.5px solid #000;
    min-width: 40px;
    text-align: center;
    font-weight: 800;
  }
  .blank-lg {
    display: inline-block;
    border-bottom: 1.5px solid #000;
    text-align: center;
    font-weight: 800;
  }
  .blank-xl {
    display: inline-block;
    border-bottom: 1.5px solid #000;
    text-align: center;
    font-weight: 800;
  }
  .signature-area {
    margin-top: 130px;
  }
  .signature-field {
    width: 460px;
    border-bottom: 1.5px solid #000;
    font-size: 26px;
    min-height: 36px;
    margin-bottom: 10px;
    font-weight: 800;
  }
  .signature-label {
    font-weight: 700;
    font-size: 26px;
    margin-bottom: 10px;
  }
  .contact-line {
    font-size: 26px;
  }
</style>
<div class="sheet">

  <div class="top-header">
    <div class="f2-badge">F2</div>
    <div class="uni">
      <div class="uni-left">
        Escuela de Cine y Televisi\u00f3n<br>
        Facultad de Artes<br>
        Sede Bogot\u00e1
      </div>
      <div class="uni-divider"></div>
      <img class="uni-logo" src="assets/unal_logo.png" alt="UNAL">
    </div>
  </div>

  <div class="title">
    <h1>ACTA DE COMPROMISO</h1>
  </div>

  <div class="declaration">
    Yo, <span class="blank-xl">${escHtml(nombre) || "___________________________________"}</span>, identificado (a) con ${escHtml(docTypeLabel)} n\u00famero <span class="blank-lg">${escHtml(numDoc) || "_______________________"}</span>, me hago responsable de los equipos que retiro del Laboratorio de Instrumentos de Producci\u00f3n Audiovisual de la Escuela de Cine y Televisi\u00f3n. As\u00ed mismo, me hago responsable de cualquier da\u00f1o f\u00edsico, t\u00e9cnico o p\u00e9rdida que pueda suceder durante la manipulaci\u00f3n de los equipos.
  </div>

  <div class="declaration">
    El periodo de pr\u00e9stamo inicia el ${periodDateHtml(periodStart)}, y finaliza el ${periodDateHtml(periodEnd)}.
  </div>

  <div class="declaration">
    Se hace constancia el ${constanciaHtml(constancia)}.
  </div>

  <div class="signature-area">
    <div class="signature-field">${firma ? escHtml(nombre) : ""}</div>
    <div class="signature-label">Firma del Directo Responsable</div>
    <div class="contact-line">N\u00famero de contacto: ${escHtml(contacto)}</div>
  </div>

</div>`;
}
