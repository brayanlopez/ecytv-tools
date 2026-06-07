import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { generatePDF } from "../common/generate-pdf.js";
import { f3Config } from "./f3-config.js";
import { buildF3Template } from "./f3-template.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"));

const api = createFormFactory({
  ...f3Config,
  generators: { pdf: (d) => generatePDF(buildF3Template, f3Config.buildExportFilename, d) },
});

api.init();

const tbody = document.getElementById("equip-tbody");
const form = document.getElementById("f3-form");
api.loadHistory(tbody, form);
