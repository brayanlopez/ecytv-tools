import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { generatePDF } from "../common/generate-pdf.js";
import { f4Config } from "./f4-config.js";
import { buildF4Template } from "./f4-template.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"));

const api = createFormFactory({
  ...f4Config,
  generators: { pdf: (d) => generatePDF(buildF4Template, f4Config.buildExportFilename, d) },
});

api.init();

const tbody = document.getElementById("sala-tbody");
const form = document.getElementById("f4-form");
api.loadHistory(tbody, form);
