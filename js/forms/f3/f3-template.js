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

export function buildF3Template(data) {
  const {
    proyecto = "",
    asignatura = "",
    docente = "",
    autorizado = "",
    "numero-documento": numDoc = "",
    tiun = "",
    celular = "",
    lugar = "",
    "fecha-retiro": fechaRetiro = "",
    "fecha-entrega": fechaEntrega = "",
    observaciones = "",
    equipos = [],
  } = data;

  const retiroDate = formatDate(fechaRetiro);
  const retiroTime = formatTime(fechaRetiro);
  const entregaDate = formatDate(fechaEntrega);
  const entregaTime = formatTime(fechaEntrega);

  const equipRows = equipos
    .slice(0, 14)
    .map(
      (eq) => `
        <tr>
          <td class="small-col">${escHtml(eq.item || "")}</td>
          <td class="type-col">${escHtml(eq.tipo || "")}</td>
          <td class="qty-col">${escHtml(eq.cantidad || "")}</td>
          <td class="code-col">${escHtml(eq.codigo || "")}</td>
          <td class="elem-col">${escHtml(eq.elemento || "")}</td>
        </tr>`,
    )
    .join("");

  const emptySlots = Math.max(0, 14 - equipos.length);
  const emptyRows = Array(emptySlots)
    .fill("<tr><td></td><td></td><td></td><td></td><td></td></tr>")
    .join("");

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
  .f3-badge {
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
    font-size: 18px;
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
    font-size: 11px;
    line-height: 1.1;
    vertical-align: middle;
  }
  .label {
    font-weight: 800;
    text-align: center;
    width: 20%;
    font-size: 11px;
  }
  .value {
    width: 30%;
    text-align: left;
    padding-left: 10px;
  }
  .main-table td {
    height: 44px;
  }
  .equipment-table {
    margin-top: 24px;
  }
  .equipment-table th {
    height: 36px;
    font-size: 12px;
    font-weight: 800;
    text-align: center;
  }
  .equipment-table td {
    height: 30px;
    font-size: 11px;
  }
  .small-col {
    width: 8%;
    text-align: center;
  }
  .type-col {
    width: 16%;
  }
  .qty-col {
    width: 10%;
    text-align: center;
  }
  .code-col {
    width: 18%;
    text-align: center;
  }
  .elem-col {
    width: 48%;
  }
  .obs-row td {
    height: 56px;
  }
  .signature-area {
    margin-top: 24px;
  }
  .signature-table td {
    height: 60px;
  }
  .signature-title {
    font-weight: 900;
    text-align: center;
    font-size: 12px;
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
    height: 22px;
    padding: 2px 5px;
  }
</style>
</head>
<body>
<div class="sheet">

  <div class="top-header">
    <div class="f3-badge">F3</div>
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
    <h1>SOLICITUD DE RESERVA Y PR\u00c9STAMO DE ELEMENTOS BODEGA DE ARTE</h1>
  </div>

  <table class="main-table">
    <tr>
      <td class="label">NOMBRE DEL PROYECTO:</td>
      <td class="value">${escHtml(proyecto)}</td>
      <td class="label">ASIGNATURA:</td>
      <td class="value">${escHtml(asignatura)}</td>
    </tr>
    <tr>
      <td class="label">AUTORIZADO:</td>
      <td class="value">${escHtml(autorizado)}</td>
      <td class="label">TIUN:</td>
      <td class="value">${escHtml(tiun)}</td>
    </tr>
    <tr>
      <td class="label">LUGAR DE GRABACI\u00d3N:</td>
      <td class="value">${escHtml(lugar)}</td>
      <td class="label">CELULAR:</td>
      <td class="value">${escHtml(celular)}</td>
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
      <th class="small-col">ITEM</th>
      <th class="type-col">TIPO</th>
      <th class="qty-col">CANT.</th>
      <th class="code-col">C\u00d3DIGO</th>
      <th class="elem-col">ELEMENTO</th>
    </tr>
    ${equipRows}
    ${emptyRows}
    <tr class="obs-row">
      <td class="label">OBSERVACIONES:</td>
      <td colspan="4">${escHtml(observaciones)}</td>
    </tr>
    <tr style="height:44px">
      <td class="label">DOCENTE QUE AUTORIZA:</td>
      <td class="center">${escHtml(docente)}</td>
      <td class="label">FIRMA DEL DOCENTE:</td>
      <td colspan="2"></td>
    </tr>
  </table>

  <div class="signature-area">
    <table class="signature-table">
      <tr>
        <td class="big-empty"></td>
        <td class="big-empty"></td>
      </tr>
      <tr>
        <td class="signature-title">FIRMA DEL ESTUDIANTE AUTORIZADO</td>
        <td class="signature-title">FIRMA DEL MONITOR RESPONSABLE</td>
      </tr>
      <tr class="footer-mini">
        <td class="center">
          <span class="bold">NOMBRE:</span>
          &nbsp;&nbsp;&nbsp; ${escHtml(autorizado)}
        </td>
        <td class="center">
          <span class="bold">NOMBRE:</span>
          &nbsp;&nbsp;&nbsp; _________________________
        </td>
      </tr>
      <tr class="footer-mini">
        <td class="center">
          <span class="bold">C.C.:</span>
          &nbsp;&nbsp;&nbsp; ${escHtml(numDoc)}
        </td>
        <td class="center">
          <span class="bold">C.C.:</span>
          &nbsp;&nbsp;&nbsp; _________________________
        </td>
      </tr>
    </table>
  </div>

</div>`;
}
