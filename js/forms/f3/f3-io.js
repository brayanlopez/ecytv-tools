import { createFormFactory } from "../common/form-factory.js";
import { f3Config } from "./f3-config.js";

const { handleExportJSON, handleExportYAML, handleImport } = createFormFactory(f3Config);

export { handleExportJSON, handleExportYAML, handleImport };
