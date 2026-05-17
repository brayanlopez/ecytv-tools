import { createFormFactory } from "../common/form-factory.js";
import { f2Config } from "./f2-config.js";

const { collectFormData, restoreFormData } = createFormFactory(f2Config);

export { collectFormData, restoreFormData };
