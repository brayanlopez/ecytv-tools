import { createFormFactory } from "../common/form-factory.js";
import { f4Config } from "./f4-config.js";

const { collectFormData, restoreFormData } = createFormFactory(f4Config);

export function getSalasData(tbody) {
  const data = collectFormData(tbody);
  return data.salas;
}

export { collectFormData, restoreFormData };
