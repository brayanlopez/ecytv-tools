import { createFormFactory } from "../common/form-factory.js";
import { f1Config } from "./f1-config.js";

const { handleExportJSON, handleExportYAML, handleImport } =
  createFormFactory(f1Config);

export { handleExportJSON, handleExportYAML, handleImport };
