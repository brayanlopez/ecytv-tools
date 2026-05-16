export function collectFormData() {
  return {
    nombre: document.getElementById("nombre").value,
    "tipo-documento": document.getElementById("tipo-documento").value,
    "numero-documento": document.getElementById("numero-documento").value,
    contacto: document.getElementById("contacto").value,
    "periodo-inicial": document.getElementById("periodo-inicial").value,
    "periodo-final": document.getElementById("periodo-final").value,
    "fecha-constancia": document.getElementById("fecha-constancia").value,
    "firma-nombre": document.getElementById("firma-nombre").checked,
    observaciones: document.getElementById("observaciones").value,
  };
}
