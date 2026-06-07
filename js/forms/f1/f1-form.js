import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { generatePDF } from "../common/generate-pdf.js";
import { f1Config } from "./f1-config.js";
import { buildF1Template } from "./f1-template.js";
import { generateF1ODS } from "./f1-ods.js";
import { generateF1XLSX } from "./f1-xlsx.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"), { showOds: true, showXlsx: true });

const api = createFormFactory({
  ...f1Config,
  generators: {
    pdf: (d) => generatePDF(buildF1Template, f1Config.buildExportFilename, d),
    ods: generateF1ODS,
    xlsx: generateF1XLSX,
  },
});

api.init();

const tbody = document.getElementById("equip-tbody");
const form = document.getElementById("f1-form");
api.loadHistory(tbody, form);
