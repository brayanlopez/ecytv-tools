import { createFormFactory } from "../common/form-factory.js";
import { f4Config } from "./f4-config.js";

const { handleExportJSON, handleExportYAML, handleImport } =
  createFormFactory(f4Config);

export { handleExportJSON, handleExportYAML, handleImport };
