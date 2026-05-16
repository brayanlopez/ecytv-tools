export function getEquipData(tbody) {
  return Array.from(tbody.querySelectorAll(".equip-row")).map((row) => ({
    item: row.querySelector('input[name="equipo-item"]').value || "",
    tipo: row.querySelector('input[name="equipo-tipo"]').value || "",
    cantidad: row.querySelector('input[name="equipo-cantidad"]').value || "",
    codigo: row.querySelector('input[name="equipo-codigo"]').value || "",
    elemento: row.querySelector('input[name="equipo-elemento"]').value || "",
  }));
}

export function collectFormData(tbody) {
  return {
    proyecto: document.getElementById("proyecto").value,
    asignatura: document.getElementById("asignatura").value,
    docente: document.getElementById("docente").value,
    autorizado: document.getElementById("autorizado").value,
    "tipo-documento": document.getElementById("tipo-documento").value,
    "numero-documento": document.getElementById("numero-documento").value,
    tiun: document.getElementById("tiun").value,
    celular: document.getElementById("celular").value,
    lugar: document.getElementById("lugar").value,
    "fecha-retiro": document.getElementById("fecha-retiro").value,
    "fecha-entrega": document.getElementById("fecha-entrega").value,
    "mismo-dia": document.getElementById("mismo-dia").checked,
    observaciones: document.getElementById("observaciones").value,
    equipos: getEquipData(tbody),
  };
}

export function restoreFormData(data, tbody, form) {
  if (!data) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  const setChecked = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };

  setVal("proyecto", data.proyecto);
  setVal("asignatura", data.asignatura);
  setVal("docente", data.docente);
  setVal("autorizado", data.autorizado);
  setVal("tipo-documento", data["tipo-documento"]);
  setVal("numero-documento", data["numero-documento"]);
  setVal("tiun", data.tiun);
  setVal("celular", data.celular);
  setVal("lugar", data.lugar);
  setVal("fecha-retiro", data["fecha-retiro"]);
  setVal("fecha-entrega", data["fecha-entrega"]);
  setVal("observaciones", data.observaciones);

  setChecked("mismo-dia", data["mismo-dia"]);
  if (data["mismo-dia"] && data["fecha-retiro"]) {
    document.getElementById("fecha-entrega").value = data["fecha-retiro"];
    document.getElementById("fecha-entrega").disabled = true;
  } else {
    document.getElementById("fecha-entrega").disabled = false;
  }

  const rows = tbody.querySelectorAll(".equip-row");
  for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
  const firstRow = tbody.querySelector(".equip-row");
  if (firstRow) {
    firstRow.querySelectorAll("input").forEach((inp) => (inp.value = ""));
  }

  const equipos = data.equipos || [];
  equipos.forEach((eq, idx) => {
    if (idx === 0 && firstRow) {
      firstRow.querySelector('input[name="equipo-item"]').value = eq.item || "";
      firstRow.querySelector('input[name="equipo-tipo"]').value = eq.tipo || "";
      firstRow.querySelector('input[name="equipo-cantidad"]').value = eq.cantidad || "";
      firstRow.querySelector('input[name="equipo-codigo"]').value = eq.codigo || "";
      firstRow.querySelector('input[name="equipo-elemento"]').value = eq.elemento || "";
    } else {
      const row = document.createElement("tr");
      row.className = "equip-row";
      row.innerHTML = `
        <td data-label="Item"><input type="text" class="item-num" name="equipo-item" placeholder="Item" value="${eq.item || ""}" aria-label="Número de item"></td>
        <td data-label="Tipo"><input type="text" name="equipo-tipo" placeholder="Tipo" required value="${eq.tipo || ""}" aria-label="Tipo"></td>
        <td data-label="Cantidad"><input type="number" name="equipo-cantidad" placeholder="Cantidad" required value="${eq.cantidad || ""}" aria-label="Cantidad" min="1"></td>
        <td data-label="Código"><input type="text" name="equipo-codigo" placeholder="Código" required value="${eq.codigo || ""}" aria-label="Código"></td>
        <td data-label="Elemento"><input type="text" name="equipo-elemento" placeholder="Elemento" required value="${eq.elemento || ""}" aria-label="Elemento"></td>
        <td data-label=""><button type="button" class="btn-remove-equip" title="Eliminar elemento">✕</button></td>
      `;
      row.querySelector(".btn-remove-equip").addEventListener("click", () => {
        if (tbody.children.length > 1) row.remove();
      });
      tbody.appendChild(row);
    }
  });

  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}
