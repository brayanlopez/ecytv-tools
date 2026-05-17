import {
  ASIGNATURAS_SUGERIDAS,
  SALAS_SUGERIDAS,
} from "../../utils/constants.js";

export const f4Config = {
  formId: "f4-form",
  exportFilename: "F4-Solicitud-Salas-Edicion",

  fields: [
    { id: "proyecto" },
    { id: "asignatura" },
    { id: "docente" },
    { id: "directo-responsable" },
    { id: "tipo-documento" },
    { id: "numero-documento" },
    { id: "tiun" },
    { id: "observaciones" },
  ],

  table: {
    tbodyId: "sala-tbody",
    addBtnId: "add-sala-btn",
    rowClass: "sala-row",
    itemName: "sala",
    dataKey: "salas",
    columns: [
      {
        name: "sala-nombre",
        key: "nombre",
        label: "Sala",
        placeholder: "Sala",
      },
      {
        name: "sala-fecha",
        key: "fecha",
        label: "Fecha",
        required: true,
        type: "date",
      },
      {
        name: "sala-hora-inicio",
        key: "hora-inicio",
        label: "Inicio",
        required: true,
        type: "time",
      },
      {
        name: "sala-hora-fin",
        key: "hora-fin",
        label: "Finalización",
        required: true,
        type: "time",
      },
    ],
  },

  datalists: [
    { elementId: "asignaturas-sugeridas", source: ASIGNATURAS_SUGERIDAS },
    { elementId: "salas-sugeridas", source: SALAS_SUGERIDAS },
  ],

  historyConfig: {
    key: "f4-history",
    getTitle: (d) => d.proyecto || "(sin proyecto)",
    getSubtitle: (d) =>
      [d["directo-responsable"], d.asignatura].filter(Boolean).join(" — "),
    isValid: (d) => d.proyecto?.trim() && d["directo-responsable"]?.trim(),
    warnMsg:
      "Completa al menos el nombre del proyecto y el directo responsable antes de guardar.",
    successMsg: "Solicitud guardada en el historial.",
  },
};
