import { createFormFactory } from "../common/form-factory.js";
import { f2Config } from "./f2-config.js";

const { handleExportJSON, handleExportYAML, handleImport } = createFormFactory(f2Config);

export { handleExportJSON, handleExportYAML, handleImport };
