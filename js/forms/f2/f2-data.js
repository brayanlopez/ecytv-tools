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

export function restoreFormData(data, form) {
  if (!data) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  const setChecked = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };

  setVal("nombre", data.nombre);
  setVal("tipo-documento", data["tipo-documento"]);
  setVal("numero-documento", data["numero-documento"]);
  setVal("contacto", data.contacto);
  setVal("periodo-inicial", data["periodo-inicial"]);
  setVal("periodo-final", data["periodo-final"]);
  setVal("fecha-constancia", data["fecha-constancia"]);
  setChecked("firma-nombre", data["firma-nombre"]);
  setVal("observaciones", data.observaciones);

  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}
