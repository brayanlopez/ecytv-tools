import { escHtml } from "../common/esc-html.js";

export function buildF4Template(data) {
  const {
    proyecto = "",
    asignatura = "",
    docente = "",
    "directo-responsable": directoResponsable = "",
    "numero-documento": numDoc = "",
    tiun = "",
    observaciones = "",
    salas = [],
  } = data;

  const salaRows = salas
    .slice(0, 4)
    .map(
      (s) => `
        <tr>
          <td class="sala-name-col">${escHtml(s.nombre || "")}</td>
          <td class="sala-date-col">${escHtml(s.fecha || "")}</td>
          <td class="sala-time-col">${escHtml(s["hora-inicio"] || "")}</td>
          <td class="sala-time-col">${escHtml(s["hora-fin"] || "")}</td>
        </tr>`,
    )
    .join("");

  const emptySlots = Math.max(0, 4 - salas.length);
  const emptyRows = Array(emptySlots)
    .fill("<tr><td></td><td></td><td></td><td></td></tr>")
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
  .f4-badge {
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
  .sala-table {
    margin-top: 28px;
  }
  .sala-table th {
    height: 36px;
    font-size: 12px;
    font-weight: 800;
    text-align: center;
  }
  .sala-table td {
    height: 34px;
    font-size: 12px;
  }
  .sala-name-col {
    width: 30%;
    text-align: center;
  }
  .sala-date-col {
    width: 28%;
    text-align: center;
  }
  .sala-time-col {
    width: 21%;
    text-align: center;
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
    <div class="f4-badge">F4</div>
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
    <h1>SOLICITUD DE RESERVA Y PR\u00c9STAMO SALAS DE EDICI\u00d3N</h1>
    <p>
      *Revisa disponibilidad antes de diligenciar.
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
      <td class="value">${escHtml(directoResponsable)}</td>
      <td class="label">TIUN<br><span style="font-weight:normal">(Del directo responsable):</span></td>
      <td class="value">${escHtml(tiun)}</td>
    </tr>
  </table>

  <table class="sala-table">
    <tr>
      <th class="sala-name-col">SALA ADJUDICADA</th>
      <th class="sala-date-col">FECHA</th>
      <th class="sala-time-col">HORA DE INICIO</th>
      <th class="sala-time-col">HORA DE FINALIZACI\u00d3N</th>
    </tr>
    ${salaRows}
    ${emptyRows}
    <tr class="obs-row">
      <td class="label">OBSERVACIONES:</td>
      <td colspan="3">${escHtml(observaciones)}</td>
    </tr>
    <tr style="height:44px">
      <td class="label">DOCENTE QUE AUTORIZA:</td>
      <td class="center">${escHtml(docente)}</td>
      <td class="label">FIRMA DEL DOCENTE:</td>
      <td></td>
    </tr>
  </table>

  <div class="signature-area">
    <table class="signature-table">
      <tr>
        <td class="big-empty"></td>
        <td class="big-empty"></td>
      </tr>
      <tr>
        <td class="signature-title">FIRMA DEL DIRECTO RESPONSABLE</td>
        <td class="signature-title">FIRMA DEL LABORATORIO</td>
      </tr>
      <tr class="footer-mini">
        <td class="center">
          <span class="bold">NOMBRE:</span>
          &nbsp;&nbsp;&nbsp; ${escHtml(directoResponsable)}
        </td>
        <td class="center">
          ______________________________<br>
          C.C.: __________________
        </td>
      </tr>
      <tr class="footer-mini">
        <td class="center">
          <span class="bold">C.C.:</span>
          &nbsp;&nbsp;&nbsp; ${escHtml(numDoc)}
        </td>
        <td></td>
      </tr>
    </table>
  </div>

</div>`;
}
