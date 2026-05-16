import {
  downloadJSON,
  downloadYAML,
  importFromFile,
} from "../common/io-config.js";
import { collectFormData, restoreFormData } from "./f2-data.js";

export async function handleExportJSON() {
  const data = collectFormData();
  downloadJSON(data, "F2-Acta-Compromiso");
  window.EcytvUI.showSnackbar(
    "Datos exportados en JSON correctamente.",
    "success",
  );
}

export async function handleExportYAML() {
  const data = collectFormData();
  downloadYAML(data, "F2-Acta-Compromiso");
  window.EcytvUI.showSnackbar(
    "Datos exportados en YAML correctamente.",
    "success",
  );
}

export async function handleImport(form) {
  try {
    const data = await importFromFile();
    restoreFormData(data, form);
    window.EcytvUI.showSnackbar("Datos importados correctamente.", "success");
  } catch (err) {
    window.EcytvUI.showSnackbar(err.message, "error");
  }
}
