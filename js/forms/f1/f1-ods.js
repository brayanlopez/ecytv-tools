export async function generateF1ODS(getEquipData) {
  try {
    const resp = await fetch("data/f1-template.ods");
    if (!resp.ok) throw new Error("No se pudo cargar la plantilla ODS");
    const buf = await resp.arrayBuffer();

    const zip = await JSZip.loadAsync(buf);
    const contentXml = await zip.file("content.xml").async("string");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentXml, "text/xml");

    const TABLE_NS = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";
    const TEXT_NS = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

    const tables = xmlDoc.getElementsByTagNameNS(TABLE_NS, "table");
    if (!tables.length)
      throw new Error("No se encontró la tabla en la plantilla");
    const table = tables[0];
    const rows = table.getElementsByTagNameNS(TABLE_NS, "table-row");

    const rowRefs = {
      proyecto: rows[6],
      responsable: rows[7],
      lugar: rows[8],
      prestamo: rows[9],
      fechaRetiro: rows[11],
      horaRetiro: rows[12],
      equipHeader: rows[15],
      observaciones: rows[30],
      docente: rows[31],
      nombre: rows[35],
      cc: rows[36],
    };

    const equipRows = [];
    for (let i = 0; i < 14; i++) equipRows.push(rows[16 + i]);

    function setCellOnRow(rowRef, cellIdx, value) {
      if (!rowRef) return;
      const cells = rowRef.getElementsByTagNameNS(TABLE_NS, "table-cell");
      const cell = cells[cellIdx];
      if (!cell) return;
      let p = cell.getElementsByTagNameNS(TEXT_NS, "p")[0];
      if (!p) {
        p = xmlDoc.createElementNS(TEXT_NS, "p");
        cell.appendChild(p);
      }
      p.textContent = value;
    }

    setCellOnRow(
      rowRefs.proyecto,
      2,
      document.getElementById("proyecto").value,
    );
    setCellOnRow(
      rowRefs.proyecto,
      4,
      document.getElementById("asignatura").value,
    );

    setCellOnRow(
      rowRefs.responsable,
      2,
      document.getElementById("responsable").value,
    );
    const tiun = document.getElementById("tiun").value;
    setCellOnRow(rowRefs.responsable, 4, tiun);

    setCellOnRow(rowRefs.lugar, 2, document.getElementById("lugar").value);
    setCellOnRow(rowRefs.lugar, 4, document.getElementById("celular").value);

    const prestamo = document.getElementById("tipo-prestamo").value;
    if (prestamo === "Interno") {
      setCellOnRow(rowRefs.prestamo, 2, "X");
      setCellOnRow(rowRefs.prestamo, 4, "");
    } else {
      setCellOnRow(rowRefs.prestamo, 2, "");
      setCellOnRow(rowRefs.prestamo, 4, "X");
    }

    const retiro = document.getElementById("fecha-retiro").value;
    const entrega = document.getElementById("fecha-entrega").value;
    if (retiro) {
      const parts = retiro.split("T");
      setCellOnRow(rowRefs.fechaRetiro, 2, parts[0]);
      setCellOnRow(rowRefs.horaRetiro, 2, parts[1] || "");
    }
    if (entrega) {
      const parts = entrega.split("T");
      setCellOnRow(rowRefs.fechaRetiro, 4, parts[0]);
      setCellOnRow(rowRefs.horaRetiro, 4, parts[1] || "");
    }

    const equipData = getEquipData();
    setCellOnRow(rowRefs.equipHeader, 1, "ITEM");

    for (let i = 0; i < 14; i++) {
      const row = equipRows[i];
      if (!row) continue;
      const cells = row.getElementsByTagNameNS(TABLE_NS, "table-cell");
      const clearCell = (ci) => {
        const c = cells[ci];
        if (!c) return;
        const p = c.getElementsByTagNameNS(TEXT_NS, "p")[0];
        if (p) p.textContent = "";
      };

      if (i < equipData.length) {
        setCellOnRow(row, 1, equipData[i].item);
        setCellOnRow(row, 2, equipData[i].nombre);
        setCellOnRow(row, 3, equipData[i].consecutivo);
      } else {
        clearCell(1);
        clearCell(2);
        clearCell(3);
      }
    }

    setCellOnRow(
      rowRefs.observaciones,
      2,
      document.getElementById("observaciones").value,
    );

    setCellOnRow(rowRefs.docente, 2, document.getElementById("docente").value);
    setCellOnRow(rowRefs.docente, 4, "_________________________");

    setCellOnRow(
      rowRefs.nombre,
      2,
      "NOMBRE: " + document.getElementById("responsable").value,
    );
    setCellOnRow(rowRefs.cc, 1, "C.C.: " + tiun);

    if (equipData.length > 14) {
      const parent = rowRefs.observaciones.parentNode;
      const templateRow = equipRows[0];

      for (let i = 14; i < equipData.length; i++) {
        const newRow = xmlDoc.importNode(templateRow, true);
        const newCells = newRow.getElementsByTagNameNS(TABLE_NS, "table-cell");
        for (let ci = 0; ci < newCells.length; ci++) {
          const ps = newCells[ci].getElementsByTagNameNS(TEXT_NS, "p");
          for (let pi = 0; pi < ps.length; pi++) ps[pi].textContent = "";
        }
        const setNewCell = (ci, val) => {
          const c = newCells[ci];
          if (!c) return;
          let p = c.getElementsByTagNameNS(TEXT_NS, "p")[0];
          if (!p) {
            p = xmlDoc.createElementNS(TEXT_NS, "p");
            c.appendChild(p);
          }
          p.textContent = val;
        };
        setNewCell(1, equipData[i].item);
        setNewCell(2, equipData[i].nombre);
        setNewCell(3, equipData[i].consecutivo);
        parent.insertBefore(newRow, rowRefs.observaciones);
      }
    }

    const serializer = new XMLSerializer();
    const newContentXml = serializer.serializeToString(xmlDoc.documentElement);
    zip.file("content.xml", newContentXml);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "F1-Solicitud-Prestamo-Equipos.ods";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    window.EcytvUI.showSnackbar(
      "Error al generar el archivo ODS: " + err.message,
      "error",
    );
  }
}
