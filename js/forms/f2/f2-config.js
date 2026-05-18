import { buildFilename } from "../common/filename.js";

export const f2Config = {
  formId: "f2-form",
  buildExportFilename: (d) =>
    buildFilename({
      formId: "f2",
      project: "acta",
      username: d.nombre,
      date: d["fecha-constancia"],
    }),

  fields: [
    { id: "nombre" },
    { id: "tipo-documento" },
    { id: "numero-documento" },
    { id: "contacto" },
    { id: "periodo-inicial" },
    { id: "periodo-final" },
    { id: "fecha-constancia" },
    { id: "firma-nombre", type: "checkbox" },
    { id: "observaciones" },
  ],

  historyConfig: {
    key: "f2-history",
    getTitle: (d) => d.nombre || "(sin nombre)",
    getSubtitle: () => "",
    isValid: (d) => d.nombre?.trim(),
    warnMsg: "Completa al menos el nombre antes de guardar.",
    successMsg: "Acta guardada en el historial.",
  },
};
