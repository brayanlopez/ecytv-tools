import { createFormFactory } from "../common/form-factory.js";
import { f3Config } from "./f3-config.js";

const { collectFormData, restoreFormData } = createFormFactory(f3Config);

export function getEquipData(tbody) {
  const data = collectFormData(tbody);
  return data.equipos;
}

export { collectFormData, restoreFormData };
