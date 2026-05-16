export function getSalasData(tbody) {
  return Array.from(tbody.querySelectorAll(".sala-row")).map((row) => ({
    nombre: row.querySelector('input[name="sala-nombre"]').value || "",
    fecha: row.querySelector('input[name="sala-fecha"]').value || "",
    "hora-inicio":
      row.querySelector('input[name="sala-hora-inicio"]').value || "",
    "hora-fin": row.querySelector('input[name="sala-hora-fin"]').value || "",
  }));
}

export function collectFormData(tbody) {
  return {
    proyecto: document.getElementById("proyecto").value,
    asignatura: document.getElementById("asignatura").value,
    docente: document.getElementById("docente").value,
    "directo-responsable": document.getElementById("directo-responsable").value,
    "tipo-documento": document.getElementById("tipo-documento").value,
    "numero-documento": document.getElementById("numero-documento").value,
    tiun: document.getElementById("tiun").value,
    observaciones: document.getElementById("observaciones").value,
    salas: getSalasData(tbody),
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
  setVal("directo-responsable", data["directo-responsable"]);
  setVal("tipo-documento", data["tipo-documento"]);
  setVal("numero-documento", data["numero-documento"]);
  setVal("tiun", data.tiun);
  setVal("observaciones", data.observaciones);

  const rows = tbody.querySelectorAll(".sala-row");
  for (let i = rows.length - 1; i > 0; i--) rows[i].remove();
  const firstRow = tbody.querySelector(".sala-row");
  if (firstRow) {
    firstRow.querySelectorAll("input").forEach((inp) => (inp.value = ""));
  }

  const salas = data.salas || [];
  salas.forEach((sala, idx) => {
    if (idx === 0 && firstRow) {
      firstRow.querySelector('input[name="sala-nombre"]').value =
        sala.nombre || "";
      firstRow.querySelector('input[name="sala-fecha"]').value =
        sala.fecha || "";
      firstRow.querySelector('input[name="sala-hora-inicio"]').value =
        sala["hora-inicio"] || "";
      firstRow.querySelector('input[name="sala-hora-fin"]').value =
        sala["hora-fin"] || "";
    } else {
      const row = document.createElement("tr");
      row.className = "sala-row";
      row.innerHTML = `
        <td><input type="text" name="sala-nombre" placeholder="Sala" list="salas-sugeridas" value="${sala.nombre || ""}" aria-label="Sala adjudicada"></td>
        <td><input type="date" name="sala-fecha" required value="${sala.fecha || ""}" aria-label="Fecha"></td>
        <td><input type="time" name="sala-hora-inicio" required value="${sala["hora-inicio"] || ""}" aria-label="Hora de inicio"></td>
        <td><input type="time" name="sala-hora-fin" required value="${sala["hora-fin"] || ""}" aria-label="Hora de finalización"></td>
        <td><button type="button" class="btn-remove-equip" title="Eliminar sala">✕</button></td>
      `;
      row.querySelector(".btn-remove-equip").addEventListener("click", () => {
        if (tbody.children.length > 1) row.remove();
      });
      tbody.appendChild(row);
    }
  });

  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}
