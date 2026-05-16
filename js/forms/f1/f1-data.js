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
