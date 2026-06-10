import { escHtml } from "../common/esc-html.js";

function formatDate(dateStr) {
  if (!dateStr) {
    return "";
  }
  const parts = dateStr.split("T");
  return parts[0] || "";
}

function formatTime(dateStr) {
  if (!dateStr) {
    return "";
  }
  const parts = dateStr.split("T");
  return parts[1] || "";
}

export function buildF1Template(data) {
  const {
    proyecto = "",
    asignatura = "",
    docente = "",
    responsable = "",
    celular = "",
    tiun = "",
    "tipo-documento": tipoDoc = "",
    "numero-documento": numDoc = "",
    lugar = "",
    "tipo-prestamo": tipoPrestamo = "",
    "fecha-retiro": fechaRetiro = "",
    "fecha-entrega": fechaEntrega = "",
    observaciones = "",
    equipos = [],
  } = data;

  const docTypeMap = {
    CC: "C.C.",
    CCD: "C.C.D.",
    TI: "T.I.",
    RC: "R.C.",
    CE: "C.E.",
    PP: "P.P.",
    LC: "L.C.",
    CM: "C.M.",
    RUT: "RUT",
    NIT: "NIT",
    PEP: "PEP",
    PPT: "PPT",
  };
  const docTypeLabel = docTypeMap[tipoDoc] || tipoDoc || "";

  const isInterno = tipoPrestamo === "Interno";
  const retiroDate = formatDate(fechaRetiro);
  const retiroTime = formatTime(fechaRetiro);
  const entregaDate = formatDate(fechaEntrega);
  const entregaTime = formatTime(fechaEntrega);

  const equipRows = equipos
    .map(
      (eq) => `
        <tr>
          <td class="small-col">${escHtml(eq.item || "")}</td>
          <td class="equip-col">${escHtml(eq.nombre || "")}</td>
          <td class="cons-col">${escHtml(eq.consecutivo || "")}</td>
        </tr>`,
    )
    .join("");

  const emptySlots = Math.max(0, 14 - equipos.length);
  const emptyRows = Array(emptySlots).fill("<tr><td></td><td></td><td></td></tr>").join("");

  return `<style>
  * { box-sizing: border-box; }
  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
    color: #1a1a1a;
    text-rendering: geometricPrecision;
  }
  .sheet {
    width: 1000px;
    padding: 16px 28px;
    border: 1px solid #4a4a4a;
  }
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .f1-badge {
    font-size: 72px;
    font-weight: 900;
    line-height: 1;
  }
  .uni {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 12px;
    text-align: right;
  }
  .uni-left {
    line-height: 1.3;
    margin-top: 10px;
  }
  .uni-divider {
    width: 1.5px;
    background: #333;
    align-self: stretch;
    flex-shrink: 0;
  }
  .uni-logo {
    height: 72px;
    width: auto;
    flex-shrink: 0;
  }
  .title {
    text-align: center;
    margin-bottom: 18px;
  }
  .title h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: -0.2px;
  }
  .title p {
    margin-top: 8px;
    font-size: 11px;
    line-height: 1.3;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  td, th {
    border: 1px solid #4f4f4f;
    padding: 3px 5px;
    font-size: 12px;
    line-height: 1.1;
    vertical-align: middle;
  }
  .label {
    font-weight: 800;
    text-align: center;
    width: 25%;
    font-size: 11px;
  }
  .value {
    width: 25%;
    text-align: left;
    padding-left: 10px;
  }
  .main-table td {
    height: 50px;
  }
  .equipment-table {
    margin-top: 28px;
  }
  .equipment-table th {
    height: 40px;
    font-size: 13px;
    font-weight: 800;
    text-align: center;
  }
  .equipment-table td {
    height: 34px;
    font-size: 12px;
  }
  .small-col {
    width: 13%;
    text-align: center;
  }
  .equip-col {
    width: 62%;
  }
  .cons-col {
    width: 25%;
    text-align: center;
  }
  .obs-row td {
    height: 56px;
  }
  .signature-area {
    margin-top: 28px;
  }
  .signature-table td {
    height: 64px;
  }
  .signature-title {
    font-weight: 900;
    text-align: center;
    font-size: 13px;
  }
  .center {
    text-align: center;
  }
  .bold {
    font-weight: 800;
  }
  .big-empty {
    height: 80px !important;
  }
  .footer-mini td {
    height: 24px;
    padding: 2px 5px;
  }
  .vo-bo {
    font-weight: 900;
    font-size: 14px;
    text-align: center;
  }
</style>
</head>
<body>
<div class="sheet">

  <div class="top-header">
    <div class="f1-badge">F1</div>
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
    <h1>SOLICITUD DE RESERVA Y PR\u00c9STAMO DE EQUIPOS</h1>
    <p>
      *Para diligenciar este formato es necesario revisar la disponibilidad y los datos de los
      equipos a solicitar en la<br>
      programaci\u00f3n correspondiente, ubicada en GOOGLE DRIVE.
    </p>
  </div>

  <table class="main-table">
    <tr>
      <td class="label">NOMBRE DEL PROYECTO:</td>
      <td class="value">${escHtml(proyecto)}</td>
      <td class="label">ASIGNATURA:</td>
      <td class="value">${escHtml(asignatura)}</td>
    </tr>
    <tr>
      <td class="label">DIRECTO RESPONSABLE:</td>
      <td class="value">${escHtml(responsable)}</td>
      <td class="label">TIUN<br><span style="font-weight:normal">(Del directo responsable):</span></td>
      <td class="value">${escHtml(tiun)}</td>
    </tr>
    <tr>
      <td class="label">LUGAR DE GRABACI\u00d3N:</td>
      <td class="value">${escHtml(lugar)}</td>
      <td class="label">CELULAR:</td>
      <td class="value">${escHtml(celular)}</td>
    </tr>
    <tr>
      <td class="label">PRESTAMO INTERNO</td>
      <td class="value">${isInterno ? "X" : ""}</td>
      <td class="label">PRESTAMO EXTERNO</td>
      <td class="value">${isInterno ? "" : "X"}</td>
    </tr>
    <tr>
      <td class="label">FECHA DE RETIRO:</td>
      <td class="value">${escHtml(retiroDate)}</td>
      <td class="label">FECHA DE ENTREGA:</td>
      <td class="value">${escHtml(entregaDate)}</td>
    </tr>
    <tr>
      <td class="label">HORA DE RETIRO:</td>
      <td class="value">${escHtml(retiroTime)}</td>
      <td class="label">HORA DE ENTREGA:</td>
      <td class="value">${escHtml(entregaTime)}</td>
    </tr>
  </table>

  <table class="equipment-table">
    <tr>
      <th class="small-col">(como sale en la programaci\u00f3n)</th>
      <th class="equip-col">EQUIPO</th>
      <th class="cons-col">CONSECUTIVO VIGENTE</th>
    </tr>
    ${equipRows}
    ${emptyRows}
    <tr class="obs-row">
      <td class="label">OBSERVACIONES:</td>
      <td colspan="2">${escHtml(observaciones)}</td>
    </tr>
    <tr style="height:56px">
      <td class="label">DOCENTE QUE AUTORIZA:</td>
      <td class="center">${escHtml(docente)}</td>
      <td class="label">FIRMA DEL DOCENTE:</td>
    </tr>
  </table>

  <div class="signature-area">
    <table class="signature-table">
      <tr>
        <td class="big-empty"></td>
        <td class="big-empty"></td>
        <td class="big-empty"></td>
      </tr>
      <tr>
        <td class="signature-title">FIRMA COORDINADOR DEL LABORATORIO DE PRODUCCI\u00d3N</td>
        <td class="signature-title">FIRMA DEL DIRECTO RESPONSABLE</td>
        <td rowspan="3" class="vo-bo">Vo. Bo. DIVISI\u00d3N DE VIGILANCIA</td>
      </tr>
      <tr class="footer-mini">
        <td rowspan="2" class="center">
          V\u00edctor Hugo \u00c1vila Amaya<br>
          C.C.: 19.431.803
        </td>
        <td>
          <span class="bold">NOMBRE:</span>
          &nbsp;&nbsp;&nbsp; ${escHtml(responsable)}
        </td>
      </tr>
      <tr class="footer-mini">
        <td>
          <span class="bold">DOCUMENTO:</span>
          &nbsp;&nbsp;&nbsp; ${escHtml(docTypeLabel)} ${escHtml(numDoc)}
        </td>
      </tr>
    </table>
  </div>

</div>`;
}
