document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  document.getElementById("back-link").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/#formats";
  });

  const ASIGNATURAS_SUGERIDAS = [
    "Sonido I", "Sonido II",
    "Taller de Realización y Producción I", "Taller de Realización y Producción II",
    "Taller de Realización y Producción III", "Taller de Realización y Producción IV",
    "Taller de realización y producción V", "Cinefotografía I ",
    "Cinefotografía II", "Dirección de Arte", "Dirección de Actores I",
    "Dirección de Actores II",
  ];
  const datalist = document.getElementById("asignaturas-sugeridas");
  ASIGNATURAS_SUGERIDAS.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a;
    datalist.appendChild(opt);
  });

  const form = document.getElementById("f1-form");
  const tbody = document.getElementById("equip-tbody");
  const addBtn = document.getElementById("add-equip-btn");
  const mismoDia = document.getElementById("mismo-dia");
  const fechaRetiro = document.getElementById("fecha-retiro");
  const fechaEntrega = document.getElementById("fecha-entrega");

  mismoDia.addEventListener("change", () => {
    if (mismoDia.checked && fechaRetiro.value) {
      fechaEntrega.value = fechaRetiro.value;
      fechaEntrega.disabled = true;
    } else {
      fechaEntrega.disabled = false;
    }
  });

  fechaRetiro.addEventListener("input", () => {
    if (mismoDia.checked && fechaRetiro.value) {
      fechaEntrega.value = fechaRetiro.value;
    }
  });

  addBtn.addEventListener("click", () => {
    const row = document.createElement("tr");
    row.className = "equip-row";
    row.innerHTML = `
      <td><input type="text" class="item-num" name="equipo-item" placeholder="Item"></td>
      <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required></td>
      <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required></td>
      <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
    `;
    row.querySelector(".btn-remove-equip").addEventListener("click", () => {
      if (tbody.children.length > 1) row.remove();
    });
    tbody.appendChild(row);
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove-equip");
    if (btn) {
      const row = btn.closest(".equip-row");
      if (tbody.children.length > 1) row.remove();
    }
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      const rows = tbody.querySelectorAll(".equip-row");
      for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
      const firstRow = tbody.querySelector(".equip-row");
      if (firstRow) {
        firstRow.querySelectorAll("input").forEach((inp) => (inp.value = ""));
      }
      fechaEntrega.disabled = false;
    }, 0);
  });

  function validate() {
    const required = form.querySelectorAll("[required]");
    let valid = true;
    required.forEach((el) => {
      if (!el.value.trim()) {
        el.style.borderColor = "#e63946";
        valid = false;
      } else {
        el.style.borderColor = "";
      }
    });
    if (!valid) alert("Por favor completa todos los campos obligatorios.");
    return valid;
  }

  document.getElementById("btn-pdf").addEventListener("click", generatePDF);
  document.getElementById("btn-ods").addEventListener("click", generateODS);
  document.getElementById("btn-xlsx").addEventListener("click", generateXLSX);
  document.getElementById("btn-save").addEventListener("click", saveToHistory);

  loadHistory();

  function collectFormData() {
    return {
      proyecto: document.getElementById("proyecto").value,
      asignatura: document.getElementById("asignatura").value,
      docente: document.getElementById("docente").value,
      responsable: document.getElementById("responsable").value,
      celular: document.getElementById("celular").value,
      tiun: document.getElementById("tiun").value,
      lugar: document.getElementById("lugar").value,
      "tipo-prestamo": document.getElementById("tipo-prestamo").value,
      "fecha-retiro": document.getElementById("fecha-retiro").value,
      "fecha-entrega": document.getElementById("fecha-entrega").value,
      "mismo-dia": document.getElementById("mismo-dia").checked,
      observaciones: document.getElementById("observaciones").value,
      equipos: getEquipData(),
    };
  }

  function saveToHistory() {
    const data = collectFormData();
    if (!data.proyecto.trim() && !data.responsable.trim()) {
      alert("Completa al menos el nombre del proyecto y el responsable antes de guardar.");
      return;
    }
    const history = JSON.parse(localStorage.getItem("f1-history") || "[]");
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      savedAt: new Date().toISOString(),
      data,
    };
    history.unshift(entry);
    if (history.length > 20) history.length = 20;
    localStorage.setItem("f1-history", JSON.stringify(history));
    renderHistory(history);
    alert("Solicitud guardada en el historial.");
  }

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem("f1-history") || "[]");
    renderHistory(history);
  }

  function renderHistory(history) {
    const card = document.getElementById("history-card");
    const list = document.getElementById("history-list");
    if (!history.length) {
      card.style.display = "none";
      return;
    }
    card.style.display = "";
    list.innerHTML = history
      .map((entry) => {
        const d = new Date(entry.savedAt);
        const dateStr = d.toLocaleDateString("es-CO", {
          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        const title = entry.data.proyecto || "(sin proyecto)";
        const subtitle = entry.data.responsable
          ? entry.data.responsable + (entry.data.asignatura ? " — " + entry.data.asignatura : "")
          : "";
        return `<div class="history-entry">
          <div class="history-entry-info">
            <div class="history-entry-title">${escHtml(title)}</div>
            <div class="history-entry-meta">${escHtml(dateStr)}${subtitle ? " · " + escHtml(subtitle) : ""}</div>
          </div>
          <div class="history-entry-actions">
            <button type="button" class="btn-history-restore" data-id="${entry.id}">Restaurar</button>
            <button type="button" class="btn-history-delete" data-id="${entry.id}">Eliminar</button>
          </div>
        </div>`;
      })
      .join("");

    list.querySelectorAll(".btn-history-restore").forEach((btn) => {
      btn.addEventListener("click", () => restoreFromHistory(btn.dataset.id));
    });
    list.querySelectorAll(".btn-history-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteFromHistory(btn.dataset.id));
    });
  }

  function escHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function restoreFromHistory(id) {
    const history = JSON.parse(localStorage.getItem("f1-history") || "[]");
    const entry = history.find((e) => e.id === id);
    if (!entry) return;

    const d = entry.data;
    document.getElementById("proyecto").value = d.proyecto || "";
    document.getElementById("asignatura").value = d.asignatura || "";
    document.getElementById("docente").value = d.docente || "";
    document.getElementById("responsable").value = d.responsable || "";
    document.getElementById("celular").value = d.celular || "";
    document.getElementById("tiun").value = d.tiun || "";
    document.getElementById("lugar").value = d.lugar || "";
    document.getElementById("tipo-prestamo").value = d["tipo-prestamo"] || "";
    document.getElementById("fecha-retiro").value = d["fecha-retiro"] || "";
    document.getElementById("fecha-entrega").value = d["fecha-entrega"] || "";
    document.getElementById("observaciones").value = d.observaciones || "";

    const mismoDia = document.getElementById("mismo-dia");
    mismoDia.checked = d["mismo-dia"] || false;
    if (mismoDia.checked && d["fecha-retiro"]) {
      document.getElementById("fecha-entrega").value = d["fecha-retiro"];
      document.getElementById("fecha-entrega").disabled = true;
    } else {
      document.getElementById("fecha-entrega").disabled = false;
    }

    const rows = tbody.querySelectorAll(".equip-row");
    for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
    const firstRow = tbody.querySelector(".equip-row");
    if (firstRow) {
      firstRow.querySelector('input[name="equipo-item"]').value = "";
      firstRow.querySelector('input[name="equipo-nombre"]').value = "";
      firstRow.querySelector('input[name="equipo-consecutivo"]').value = "";
    }

    const equipos = d.equipos || [];
    equipos.forEach((eq, idx) => {
      if (idx === 0 && firstRow) {
        firstRow.querySelector('input[name="equipo-item"]').value = eq.item || "";
        firstRow.querySelector('input[name="equipo-nombre"]').value = eq.nombre || "";
        firstRow.querySelector('input[name="equipo-consecutivo"]').value = eq.consecutivo || "";
      } else {
        const row = document.createElement("tr");
        row.className = "equip-row";
        row.innerHTML = `
          <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" value="${escHtml(eq.item || "")}"></td>
          <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required value="${escHtml(eq.nombre || "")}"></td>
          <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required value="${escHtml(eq.consecutivo || "")}"></td>
          <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
        `;
        row.querySelector(".btn-remove-equip").addEventListener("click", () => {
          if (tbody.children.length > 1) row.remove();
        });
        tbody.appendChild(row);
      }
    });

    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteFromHistory(id) {
    let history = JSON.parse(localStorage.getItem("f1-history") || "[]");
    history = history.filter((e) => e.id !== id);
    localStorage.setItem("f1-history", JSON.stringify(history));
    renderHistory(history);
  }

  function getEquipData() {
    return Array.from(tbody.querySelectorAll(".equip-row")).map((row) => ({
      item: row.querySelector('input[name="equipo-item"]').value || "",
      nombre: row.querySelector('input[name="equipo-nombre"]').value || "",
      consecutivo: row.querySelector('input[name="equipo-consecutivo"]').value || "",
    }));
  }

  function generatePDF() {
    if (!validate()) return;
    saveToHistory();

    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("Error al cargar la librería PDF. Verifica tu conexión a internet.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const primary = "#019587";
    const lightGray = "#f5f5f5";
    const borderGray = "#dddddd";

    function sectionHeader(text, y) {
      doc.setFillColor(primary);
      doc.rect(14, y, 182, 8, "F");
      doc.setTextColor("#ffffff");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(text, 16, y + 5.5);
      return y + 12;
    }

    function fieldRow(label, value, y) {
      doc.setFillColor(lightGray);
      doc.rect(14, y, 60, 7, "F");
      doc.setTextColor("#555555");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(label, 16, y + 5);
      doc.setTextColor("#222222");
      doc.setFont("helvetica", "normal");
      doc.text(value || "(sin especificar)", 78, y + 5);
      return y + 9;
    }

    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Solicitud de Reserva y Prestamo de Equipos", 105, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Formato F1", 105, 20, { align: "center" });

    let yPos = 36;

    yPos = sectionHeader("1. INFORMACION DEL PROYECTO", yPos);
    yPos = fieldRow("Nombre del proyecto", document.getElementById("proyecto").value, yPos);
    yPos = fieldRow("Asignatura", document.getElementById("asignatura").value, yPos);
    yPos = fieldRow("Docente que autoriza", document.getElementById("docente").value, yPos);
    yPos += 4;

    yPos = sectionHeader("2. DATOS DEL RESPONSABLE", yPos);
    yPos = fieldRow("Nombre del responsable", document.getElementById("responsable").value, yPos);
    yPos = fieldRow("Celular", document.getElementById("celular").value, yPos);
    yPos = fieldRow("TIUN", document.getElementById("tiun").value, yPos);
    yPos += 4;

    yPos = sectionHeader("3. INFORMACION DEL PRESTAMO", yPos);
    yPos = fieldRow("Lugar de grabacion", document.getElementById("lugar").value, yPos);
    yPos = fieldRow("Tipo de prestamo", document.getElementById("tipo-prestamo").value, yPos);
    yPos = fieldRow("Fecha y hora de retiro", document.getElementById("fecha-retiro").value.replace("T", " "), yPos);
    yPos = fieldRow("Fecha y hora de entrega", document.getElementById("fecha-entrega").value.replace("T", " "), yPos);
    yPos += 4;

    yPos = sectionHeader("4. EQUIPOS A SOLICITAR", yPos);

    const equipRows = getEquipData();
    if (equipRows.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [["Item", "Equipo", "Consecutivo Vigente"]],
        body: equipRows.map((r) => [r.item, r.nombre, r.consecutivo]),
        theme: "grid",
        headStyles: { fillColor: primary, fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        styles: { cellPadding: 2, lineColor: borderGray },
        margin: { left: 14, right: 14 },
        tableWidth: 182,
      });
      yPos = doc.lastAutoTable.finalY + 6;
    } else {
      yPos = fieldRow("Equipos", "(ninguno)", yPos);
      yPos += 4;
    }

    yPos = sectionHeader("5. OBSERVACIONES", yPos);
    doc.setTextColor("#222222");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const obs = document.getElementById("observaciones").value || "(sin observaciones)";
    const lines = doc.splitTextToSize(obs, 178);
    doc.text(lines, 16, yPos + 3);
    yPos = yPos + 3 + lines.length * 4 + 6;

    const now = new Date();
    const dateStr = now.toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
    doc.setFontSize(7);
    doc.setTextColor("#999999");
    doc.text("Documento generado el " + dateStr, 105, 288, { align: "center" });

    doc.save("F1-Solicitud-Prestamo-Equipos.pdf");
  }

  async function generateODS() {
    if (!validate()) return;
    saveToHistory();

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
      if (!tables.length) throw new Error("No se encontró la tabla en la plantilla");
      const table = tables[0];
      const rows = table.getElementsByTagNameNS(TABLE_NS, "table-row");

      // Capture key row references before any DOM modifications
      // (rows is a live NodeList — indices shift when rows are inserted/removed)
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
      // Equipment rows 16-29
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

      // 1. Proyecto info (row 6)
      setCellOnRow(rowRefs.proyecto, 2, document.getElementById("proyecto").value);
      setCellOnRow(rowRefs.proyecto, 4, document.getElementById("asignatura").value);

      // 2. Responsable (row 7)
      setCellOnRow(rowRefs.responsable, 2, document.getElementById("responsable").value);
      const tiun = document.getElementById("tiun").value;
      setCellOnRow(rowRefs.responsable, 4, tiun);

      // 3. Lugar / Celular (row 8)
      setCellOnRow(rowRefs.lugar, 2, document.getElementById("lugar").value);
      setCellOnRow(rowRefs.lugar, 4, document.getElementById("celular").value);

      // 4. Tipo préstamo (row 9)
      const prestamo = document.getElementById("tipo-prestamo").value;
      if (prestamo === "Interno") {
        setCellOnRow(rowRefs.prestamo, 2, "X");
        setCellOnRow(rowRefs.prestamo, 4, "");
      } else {
        setCellOnRow(rowRefs.prestamo, 2, "");
        setCellOnRow(rowRefs.prestamo, 4, "X");
      }

      // 5. Fechas (row 11-12)
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

      // 6. Equipos (rows 16-29)
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

      // 7. Observaciones (row 30) — before extra row inserts to avoid index shift
      setCellOnRow(rowRefs.observaciones, 2, document.getElementById("observaciones").value);

      // 8. Docente que autoriza (row 31)
      setCellOnRow(rowRefs.docente, 2, document.getElementById("docente").value);
      setCellOnRow(rowRefs.docente, 4, "_________________________");

      // 9. NOMBRE y C.C. (rows 35-36)
      setCellOnRow(rowRefs.nombre, 2, "NOMBRE: " + document.getElementById("responsable").value);
      setCellOnRow(rowRefs.cc, 1, "C.C.: " + tiun);

      // 10. Extra equipment rows if > 14 items
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

      // Serialize XML (use documentElement to avoid extra XML declaration)
      const serializer = new XMLSerializer();
      const newContentXml = serializer.serializeToString(xmlDoc.documentElement);

      // Update zip
      zip.file("content.xml", newContentXml);

      // Generate blob & download
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
      alert("Error al generar el archivo ODS: " + err.message);
    }
  }

  async function generateXLSX() {
    if (!validate()) return;
    saveToHistory();

    try {
      const resp = await fetch("data/f1-template.xlsx");
      if (!resp.ok) throw new Error("No se pudo cargar la plantilla XLSX");
      const buf = await resp.arrayBuffer();

      const wb = XLSX.read(buf, { type: "array", cellStyles: true });
      const ws = wb.Sheets[wb.SheetNames[0]];

      function setCell(addr, val) {
        const existing = ws[addr];
        ws[addr] = { v: val, t: "s" };
        if (existing && existing.s != null) ws[addr].s = existing.s;
      }

      const proyecto = document.getElementById("proyecto").value;
      const asignatura = document.getElementById("asignatura").value;
      const responsable = document.getElementById("responsable").value;
      const tiun = document.getElementById("tiun").value;
      const lugar = document.getElementById("lugar").value;
      const celular = document.getElementById("celular").value;
      const prestamo = document.getElementById("tipo-prestamo").value;
      const fechaRetiro = document.getElementById("fecha-retiro").value;
      const fechaEntrega = document.getElementById("fecha-entrega").value;
      const observaciones = document.getElementById("observaciones").value;
      const docente = document.getElementById("docente").value;

      // Row 7: Proyecto info
      setCell("C7", proyecto);
      setCell("G7", asignatura);

      // Row 8: Responsable / TIUN
      setCell("C8", responsable);
      setCell("G8", tiun);

      // Row 9: Lugar / Celular
      setCell("C9", lugar);
      setCell("G9", celular);

      // Row 10: Tipo de préstamo
      if (prestamo === "Interno") {
        setCell("D10", "X");
        setCell("G10", "");
      } else {
        setCell("D10", "");
        setCell("G10", "X");
      }

      // Rows 12-13: Fechas
      const retiro = fechaRetiro.split("T");
      const entrega = fechaEntrega.split("T");
      if (retiro[0]) setCell("C12", retiro[0]);
      if (retiro[1]) setCell("C13", retiro[1]);
      if (entrega[0]) setCell("G12", entrega[0]);
      if (entrega[1]) setCell("G13", entrega[1]);

      // Equipment rows 17-30
      const equipData = getEquipData();
      for (let i = 0; i < Math.min(14, equipData.length); i++) {
        const r = 17 + i;
        setCell("B" + r, equipData[i].item);
        setCell("C" + r, equipData[i].nombre);
        setCell("H" + r, equipData[i].consecutivo);
      }
      for (let i = equipData.length; i < 14; i++) {
        const r = 17 + i;
        setCell("B" + r, "");
        setCell("C" + r, "");
        setCell("H" + r, "");
      }

      // Row 31: Observaciones
      setCell("C31", observaciones);

      // Row 32: Docente que autoriza
      setCell("C32", docente);
      setCell("G32", "_________________________");

      // Row 37: NOMBRE
      setCell("E37", "NOMBRE: " + responsable);

      // Row 38: C.C.
      setCell("E38", "C.C.: " + tiun);

      // Extra equipment rows if > 14
      if (equipData.length > 14) {
        for (let i = 14; i < equipData.length; i++) {
          const r = 40 + i - 14;
          setCell("B" + r, equipData[i].item);
          setCell("C" + r, equipData[i].nombre);
          setCell("H" + r, equipData[i].consecutivo);
        }
      }

      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "F1-Solicitud-Prestamo-Equipos.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al generar el archivo XLSX: " + err.message);
    }
  }
});
