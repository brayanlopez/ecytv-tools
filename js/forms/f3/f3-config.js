import { ASIGNATURAS_SUGERIDAS } from "../../utils/constants.js";

export const f3Config = {
  formId: "f3-form",
  exportFilename: "F3-Solicitud-Bodega-Arte",

  fields: [
    { id: "proyecto" },
    { id: "asignatura" },
    { id: "docente" },
    { id: "autorizado" },
    { id: "tipo-documento" },
    { id: "numero-documento" },
    { id: "tiun" },
    { id: "celular" },
    { id: "lugar" },
    { id: "fecha-retiro" },
    { id: "fecha-entrega", sameDayAs: "fecha-retiro" },
    { id: "mismo-dia", type: "checkbox" },
    { id: "observaciones" },
  ],

  table: {
    tbodyId: "equip-tbody",
    addBtnId: "add-equip-btn",
    rowClass: "equip-row",
    itemName: "elemento",
    dataKey: "equipos",
    columns: [
      { name: "equipo-item", key: "item", label: "Item", placeholder: "Item" },
      {
        name: "equipo-tipo",
        key: "tipo",
        label: "Tipo",
        placeholder: "Tipo",
        required: true,
      },
      {
        name: "equipo-cantidad",
        key: "cantidad",
        label: "Cantidad",
        placeholder: "Cantidad",
        required: true,
        type: "number",
      },
      {
        name: "equipo-codigo",
        key: "codigo",
        label: "Código",
        placeholder: "Código",
        required: true,
      },
      {
        name: "equipo-elemento",
        key: "elemento",
        label: "Elemento",
        placeholder: "Elemento",
        required: true,
      },
    ],
  },

  datalists: [{ elementId: "asignaturas-sugeridas", source: ASIGNATURAS_SUGERIDAS }],

  historyConfig: {
    key: "f3-history",
    getTitle: (d) => d.proyecto || "(sin proyecto)",
    getSubtitle: (d) => [d.autorizado, d.asignatura].filter(Boolean).join(" — "),
    isValid: (d) => d.proyecto?.trim() && d.autorizado?.trim(),
    warnMsg: "Completa al menos el nombre del proyecto y el autorizado antes de guardar.",
    successMsg: "Solicitud guardada en el historial.",
  },
};
