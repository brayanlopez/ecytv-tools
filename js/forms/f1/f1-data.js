import { createFormFactory } from "../common/form-factory.js";
import { f1Config } from "./f1-config.js";

const { collectFormData, restoreFormData } = createFormFactory(f1Config);

export function getEquipData(tbody) {
  const data = collectFormData(tbody);
  return data.equipos;
}

export { collectFormData, restoreFormData };
