import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { generatePDF } from "../common/generate-pdf.js";
import { f2Config } from "./f2-config.js";
import { buildF2Template } from "./f2-template.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"));

const api = createFormFactory({
  ...f2Config,
  generators: { pdf: (d) => generatePDF(buildF2Template, f2Config.buildExportFilename, d) },
});

api.init();

const form = document.getElementById("f2-form");
api.loadHistory(null, form);
