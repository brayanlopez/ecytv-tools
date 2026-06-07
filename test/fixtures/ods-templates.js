/**
 * Shared ODS template XML builders for PDF tests.
 * These mirror the structure of actual .ods templates so tests don't depend on external files.
 */

export function buildF3ContentXml({ extraStyles = "" } = {}) {
  const styles = `
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="0.58cm"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="1.40cm"/>
    </style:style>
    <style:style style:name="co3" style:family="table-column">
      <style:table-column-properties style:column-width="3.07cm"/>
    </style:style>
    <style:style style:name="co4" style:family="table-column">
      <style:table-column-properties style:column-width="2.47cm"/>
    </style:style>
    <style:style style:name="co5" style:family="table-column">
      <style:table-column-properties style:column-width="4.05cm"/>
    </style:style>
    <style:style style:name="ce1" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce2" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce3" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce4" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce5" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:text-properties fo:font-size="58pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15.75pt"/>
    </style:style>
    <style:style style:name="ro2" style:family="table-row">
      <style:table-row-properties style:row-height="27pt"/>
    </style:style>${extraStyles}`;

  function dataRow(label1, label2) {
    return `<table:table-row table:style-name="ro2">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>${label1}</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>${label2}</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;
  }

  function emptyRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-repeated="8" table:style-name="ce3"/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;
  }

  function equipRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;
  }

  const equipHeader = `<table:table-row table:style-name="ro2">
    <table:table-cell table:style-name="ce1"/>
    <table:table-cell table:style-name="ce2"><text:p>ITEM</text:p></table:table-cell>
    <table:table-cell table:style-name="ce2"><text:p>TIPO</text:p></table:table-cell>
    <table:table-cell table:style-name="ce2"><text:p>CANTIDAD</text:p></table:table-cell>
    <table:table-cell table:style-name="ce2"><text:p>CODIGO</text:p></table:table-cell>
    <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>ELEMENTO</text:p></table:table-cell>
    <table:covered-table-cell/>
    <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>OBSERVACIONES</text:p></table:table-cell>
    <table:covered-table-cell/>
    <table:table-cell table:style-name="ce1"/>
  </table:table-row>`;

  const equipRows = [];
  for (let i = 0; i < 14; i++) {
    equipRows.push(equipRow());
  }

  const footer = `
    <table:table-row table:style-name="ro2">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>DOCENTE QUE AUTORIZA:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>FIRMA DEL DOCENTE:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>
    ${emptyRow()}
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="4" table:style-name="ce2"><text:p>FIRMA DEL ESTUDIANTE AUTORIZADO</text:p></table:table-cell>
      <table:covered-table-cell table:number-columns-repeated="3"/>
      <table:table-cell table:number-columns-spanned="4" table:style-name="ce2"><text:p>FIRMA DEL MONITOR RESPONSABLE</text:p></table:table-cell>
      <table:covered-table-cell table:number-columns-repeated="3"/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce1"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>C.C.:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce2"><text:p>C.C.:</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce3"/>
      <table:covered-table-cell/>
      <table:table-cell table:style-name="ce1"/>
    </table:table-row>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  office:version="1.3">
  <office:automatic-styles>
    ${styles}
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-column table:style-name="co2"/>
        <table:table-column table:style-name="co3"/>
        <table:table-column table:style-name="co4" table:number-columns-repeated="5"/>
        <table:table-column table:style-name="co5"/>
        ${emptyRow()}
        <table:table-row table:style-name="ro2">
          <table:table-cell table:style-name="ce1"/>
          <table:table-cell table:style-name="ce5"><text:p>F3</text:p></table:table-cell>
          <table:table-cell table:number-columns-repeated="7" table:style-name="ce3"/>
          <table:table-cell table:style-name="ce1"/>
        </table:table-row>
        <table:table-row table:style-name="ro2">
          <table:table-cell table:style-name="ce1"/>
          <table:table-cell table:number-columns-repeated="8" table:style-name="ce4"><text:p>SOLICITUD DE RESERVA Y PRESTAMO DE ELEMENTOS BODEGA DE ARTE</text:p></table:table-cell>
          <table:table-cell table:style-name="ce1"/>
        </table:table-row>
        ${emptyRow()}
        ${dataRow("NOMBRE DEL PROYECTO:", "ASIGNATURA:")}
        ${dataRow("AUTORIZADO:", "TIUN:")}
        ${dataRow("LUGAR DE GRABACION:", "CELULAR:")}
        ${dataRow("FECHA DE RETIRO:", "FECHA DE ENTREGA:")}
        ${dataRow("HORA DE RETIRO:", "HORA DE ENTREGA:")}
        ${emptyRow()}
        ${equipHeader}
        ${equipRows.join("\n")}
        ${footer}
        ${emptyRow()}
        ${emptyRow()}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}

export function buildF4ContentXml({ extraStyles = "" } = {}) {
  const styles = `
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="0.63cm"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="6.88cm"/>
    </style:style>
    <style:style style:name="co3" style:family="table-column">
      <style:table-column-properties style:column-width="0.61cm"/>
    </style:style>
    <style:style style:name="co4" style:family="table-column">
      <style:table-column-properties style:column-width="2.47cm"/>
    </style:style>
    <style:style style:name="co5" style:family="table-column">
      <style:table-column-properties style:column-width="2.33cm"/>
    </style:style>
    <style:style style:name="ce1" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce2" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce3" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce4" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000" style:vertical-align="middle"/>
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-size="18pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce5" style:family="table-cell">
      <style:table-cell-properties style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce6" style:family="table-cell">
      <style:table-cell-properties fo:border-top="none" fo:border-bottom="none" fo:border-left="thin solid #000000" fo:border-right="none" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce7" style:family="table-cell">
      <style:table-cell-properties style:vertical-align="middle"/>
      <style:text-properties fo:font-size="70pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ce8" style:family="table-cell">
      <style:table-cell-properties fo:border-top="none" fo:border-bottom="none" fo:border-left="none" fo:border-right="thin solid #000000" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="ce9" style:family="table-cell">
      <style:table-cell-properties style:vertical-align="middle"/>
      <style:text-properties fo:font-size="20pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="14.25pt"/>
    </style:style>
    <style:style style:name="ro2" style:family="table-row">
      <style:table-row-properties style:row-height="73.5pt"/>
    </style:style>
    <style:style style:name="ro3" style:family="table-row">
      <style:table-row-properties style:row-height="11.25pt"/>
    </style:style>
    <style:style style:name="ro4" style:family="table-row">
      <style:table-row-properties style:row-height="27pt"/>
    </style:style>
    <style:style style:name="ro5" style:family="table-row">
      <style:table-row-properties style:row-height="39.7pt"/>
    </style:style>
    <style:style style:name="ro6" style:family="table-row">
      <style:table-row-properties style:row-height="29.95pt"/>
    </style:style>
    <style:style style:name="ro7" style:family="table-row">
      <style:table-row-properties style:row-height="54.7pt"/>
    </style:style>${extraStyles}`;

  function emptyRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  function dataRow(label1, label2) {
    return `<table:table-row table:style-name="ro5">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>${label1}</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce2"><text:p>${label2}</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  function salaHeaderRow() {
    return `<table:table-row table:style-name="ro6">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>SALA ADJUDICADA</text:p></table:table-cell>
      <table:table-cell table:style-name="ce2"><text:p>FECHA</text:p></table:table-cell>
      <table:table-cell table:style-name="ce2"><text:p>HORA DE INICIO</text:p></table:table-cell>
      <table:table-cell table:style-name="ce2"><text:p>HORA DE FINALIZACIÓN</text:p></table:table-cell>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  function salaRow() {
    return `<table:table-row table:style-name="ro4">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>`;
  }

  const salaRows = [];
  for (let i = 0; i < 4; i++) {
    salaRows.push(salaRow());
  }

  const footer = `
    <table:table-row table:style-name="ro7">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>OBSERVACIONES:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro7">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>DOCENTE QUE AUTORIZA:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL DOCENTE:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    ${emptyRow()}
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL DIRECTO RESPONSABLE</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL LABORATORIO</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL DIRECTO RESPONSABLE</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce2"><text:p>FIRMA DEL LABORATORIO</text:p></table:table-cell>
      <table:table-cell table:style-name="ce5"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro3">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>NOMBRE:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    <table:table-row table:style-name="ro3">
      <table:table-cell table:style-name="ce6"/>
      <table:table-cell table:style-name="ce2"><text:p>C.C.:</text:p></table:table-cell>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce3"/>
      <table:table-cell table:style-name="ce8"/>
    </table:table-row>
    ${emptyRow()}
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  office:version="1.3">
  <office:automatic-styles>
    ${styles}
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-column table:style-name="co2"/>
        <table:table-column table:style-name="co3"/>
        <table:table-column table:style-name="co4"/>
        <table:table-column table:style-name="co5"/>
        ${emptyRow()}
        <table:table-row table:style-name="ro2">
          <table:table-cell table:style-name="ce6"/>
          <table:table-cell table:style-name="ce7"><text:p>F4</text:p></table:table-cell>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce8"/>
        </table:table-row>
        ${emptyRow()}
        <table:table-row table:style-name="ro4">
          <table:table-cell table:style-name="ce6"/>
          <table:table-cell table:style-name="ce9"><text:p>SOLICITUD DE RESERVA Y PRÉSTAMO SALAS DE EDICIÓN</text:p></table:table-cell>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce8"/>
        </table:table-row>
        <table:table-row table:style-name="ro1">
          <table:table-cell table:style-name="ce6"/>
          <table:table-cell table:style-name="ce5"><text:p>*Revisa disponibilidad antes de diligenciar.</text:p></table:table-cell>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce5"/>
          <table:table-cell table:style-name="ce8"/>
        </table:table-row>
        ${emptyRow()}
        ${dataRow("NOMBRE DEL PROYECTO:", "ASIGNATURA:")}
        ${dataRow("DIRECTO RESPONSABLE:", "TIUN:")}
        ${emptyRow()}
        ${salaHeaderRow()}
        ${salaRows.join("\n")}
        ${emptyRow()}
        ${footer}
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}

export function buildF1ContentXml({ extraStyles = "" } = {}) {
  const styles = `
    <style:style style:name="co1" style:family="table-column">
      <style:table-column-properties style:column-width="0.54cm"/>
    </style:style>
    <style:style style:name="co2" style:family="table-column">
      <style:table-column-properties style:column-width="3.92cm"/>
    </style:style>
    <style:style style:name="co3" style:family="table-column">
      <style:table-column-properties style:column-width="2.47cm"/>
    </style:style>
    <style:style style:name="co4" style:family="table-column">
      <style:table-column-properties style:column-width="1.20cm"/>
    </style:style>
    <style:style style:name="ce12" style:family="table-cell">
      <style:table-cell-properties fo:border-left="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce11" style:family="table-cell">
      <style:table-cell-properties fo:border-right="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce30" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce31" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce16" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce25" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ce33" style:family="table-cell">
      <style:table-cell-properties fo:border="thin solid #000000"/>
    </style:style>
    <style:style style:name="ro1" style:family="table-row">
      <style:table-row-properties style:row-height="15.75pt"/>
    </style:style>
    <style:style style:name="ro6" style:family="table-row">
      <style:table-row-properties style:row-height="51.75pt"/>
    </style:style>${extraStyles}`;

  function dataRow(label1, data1, label2, data2) {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>${label1}</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"><text:p>${data1}</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>${label2}</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"><text:p>${data2}</text:p></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`;
  }

  function dummyRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:number-columns-spanned="8" table:style-name="ce31"/>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`;
  }

  function equipRow() {
    return `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:style-name="ce16"><text:p/></table:table-cell>
      <table:table-cell table:number-columns-spanned="5" table:style-name="ce31"><text:p/></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce31"><text:p/></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`;
  }

  const rows = [
    dummyRow(),
    dummyRow(),
    dummyRow(),
    dummyRow(),
    dummyRow(),
    dummyRow(),
    dataRow("NOMBRE DEL PROYECTO:", "", "ASIGNATURA:", ""),
    dataRow("DIRECTO RESPONSABLE:", "", "TIUN:", ""),
    dataRow("LUGAR DE GRABACIÓN:", "", "CELULAR:", ""),
    dataRow("PRESTAMO INTERNO", "", "PRESTAMO EXTERNO", ""),
    dummyRow(),
    dataRow("FECHA DE RETIRO:", "", "FECHA DE ENTREGA:", ""),
    dataRow("HORA DE RETIRO:", "", "HORA DE ENTREGA:", ""),
    dummyRow(),
    dummyRow(),
    `<table:table-row table:style-name="ro1">
      <table:table-cell table:style-name="ce12"/>
      <table:table-cell table:style-name="ce30"><text:p>ITEM</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="5" table:style-name="ce30"><text:p>EQUIPO</text:p></table:table-cell>
      <table:table-cell table:number-columns-spanned="2" table:style-name="ce30"><text:p>CONSECUTIVO VIGENTE</text:p></table:table-cell>
      <table:table-cell table:style-name="ce11"/>
    </table:table-row>`,
  ];

  for (let i = 0; i < 14; i++) {
    rows.push(equipRow());
  }

  const tableRows = rows.join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  office:version="1.3">
  <office:automatic-styles>
    ${styles}
  </office:automatic-styles>
  <office:body>
    <office:spreadsheet>
      <table:table>
        <table:table-column table:style-name="co1"/>
        <table:table-column table:style-name="co2"/>
        <table:table-column table:style-name="co3"/>
        <table:table-column table:style-name="co4" table:number-columns-repeated="5"/>
        <table:table-row table:style-name="ro6">
          <table:table-cell table:style-name="ce12"/>
          <table:table-cell table:number-columns-repeated="8" table:style-name="ce25"/>
          <table:table-cell table:style-name="ce11"/>
        </table:table-row>
        ${tableRows}
        <table:table-row table:style-name="ro6">
          <table:table-cell table:style-name="ce12"/>
          <table:table-cell table:style-name="ce33"><text:p>OBSERVACIONES:</text:p></table:table-cell>
          <table:table-cell table:number-columns-spanned="7" table:style-name="ce31"/>
          <table:table-cell table:style-name="ce11"/>
        </table:table-row>
      </table:table>
    </office:spreadsheet>
  </office:body>
</office:document-content>`;
}
