import { ASIGNATURAS_SUGERIDAS } from "../../utils/constants.js";

export const f1Config = {
  formId: "f1-form",
  exportFilename: "F1-Solicitud-Prestamo-Equipos",

  fields: [
    { id: "proyecto" },
    { id: "asignatura" },
    { id: "docente" },
    { id: "responsable" },
    { id: "celular" },
    { id: "tiun" },
    { id: "lugar" },
    { id: "tipo-prestamo" },
    { id: "fecha-retiro" },
    { id: "fecha-entrega", sameDayAs: "fecha-retiro" },
    { id: "mismo-dia", type: "checkbox" },
    { id: "observaciones" },
  ],

  table: {
    tbodyId: "equip-tbody",
    addBtnId: "add-equip-btn",
    rowClass: "equip-row",
    itemName: "equipo",
    dataKey: "equipos",
    columns: [
      { name: "equipo-item", key: "item", label: "Item", placeholder: "Item" },
      {
        name: "equipo-nombre",
        key: "nombre",
        label: "Equipo",
        placeholder: "Nombre del equipo",
        required: true,
      },
      {
        name: "equipo-consecutivo",
        key: "consecutivo",
        label: "Consecutivo",
        placeholder: "Consecutivo",
        required: true,
      },
    ],
  },

  datalists: [
    { elementId: "asignaturas-sugeridas", source: ASIGNATURAS_SUGERIDAS },
  ],

  historyConfig: {
    key: "f1-history",
    getTitle: (d) => d.proyecto || "(sin proyecto)",
    getSubtitle: (d) =>
      [d.responsable, d.asignatura].filter(Boolean).join(" — "),
    isValid: (d) => d.proyecto?.trim() && d.responsable?.trim(),
    warnMsg:
      "Completa al menos el nombre del proyecto y el responsable antes de guardar.",
    successMsg: "Solicitud guardada en el historial.",
  },
};
