import {
  downloadJSON,
  downloadYAML,
  importFromFile,
} from "../common/io-config.js";
import { collectFormData, getEquipData, restoreFormData } from "./f3-data.js";

export async function handleExportJSON(tbody) {
  const data = collectFormData(tbody);
  downloadJSON(data, "F3-Solicitud-Bodega-Arte");
  window.EcytvUI.showSnackbar(
    "Datos exportados en JSON correctamente.",
    "success",
  );
}

export async function handleExportYAML(tbody) {
  const data = collectFormData(tbody);
  downloadYAML(data, "F3-Solicitud-Bodega-Arte");
  window.EcytvUI.showSnackbar(
    "Datos exportados en YAML correctamente.",
    "success",
  );
}

export async function handleImport(tbody, form) {
  try {
    const data = await importFromFile();
    restoreFormData(data, tbody, form);
    window.EcytvUI.showSnackbar("Datos importados correctamente.", "success");
  } catch (err) {
    window.EcytvUI.showSnackbar(err.message, "error");
  }
}
