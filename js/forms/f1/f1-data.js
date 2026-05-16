export function getEquipData(tbody) {
  return Array.from(tbody.querySelectorAll(".equip-row")).map((row) => ({
    item: row.querySelector('input[name="equipo-item"]').value || "",
    nombre: row.querySelector('input[name="equipo-nombre"]').value || "",
    consecutivo:
      row.querySelector('input[name="equipo-consecutivo"]').value || "",
  }));
}

export function collectFormData(tbody) {
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
    equipos: getEquipData(tbody),
  };
}

export function restoreFormData(data, tbody, form) {
  if (!data) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  setVal("proyecto", data.proyecto);
  setVal("asignatura", data.asignatura);
  setVal("docente", data.docente);
  setVal("responsable", data.responsable);
  setVal("celular", data.celular);
  setVal("tiun", data.tiun);
  setVal("lugar", data.lugar);
  setVal("tipo-prestamo", data["tipo-prestamo"]);
  setVal("fecha-retiro", data["fecha-retiro"]);
  setVal("fecha-entrega", data["fecha-entrega"]);
  setVal("observaciones", data.observaciones);

  const mismoDia = document.getElementById("mismo-dia");
  if (mismoDia) {
    mismoDia.checked = !!data["mismo-dia"];
    if (mismoDia.checked && data["fecha-retiro"]) {
      document.getElementById("fecha-entrega").value = data["fecha-retiro"];
      document.getElementById("fecha-entrega").disabled = true;
    } else {
      document.getElementById("fecha-entrega").disabled = false;
    }
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
      firstRow.querySelector('input[name="equipo-nombre"]').value =
        eq.nombre || "";
      firstRow.querySelector('input[name="equipo-consecutivo"]').value =
        eq.consecutivo || "";
    } else {
      const row = document.createElement("tr");
      row.className = "equip-row";
      row.innerHTML = `
        <td><input type="text" class="item-num" name="equipo-item" placeholder="Item" value="${eq.item || ""}"></td>
        <td><input type="text" name="equipo-nombre" placeholder="Nombre del equipo" required value="${eq.nombre || ""}"></td>
        <td><input type="text" name="equipo-consecutivo" placeholder="Consecutivo" required value="${eq.consecutivo || ""}"></td>
        <td><button type="button" class="btn-remove-equip" title="Eliminar equipo">✕</button></td>
      `;
      row.querySelector(".btn-remove-equip").addEventListener("click", () => {
        if (tbody.children.length > 1) row.remove();
      });
      tbody.appendChild(row);
    }
  });

  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}
