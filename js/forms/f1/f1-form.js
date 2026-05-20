import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { f1Config } from "./f1-config.js";
import { generateF1PDF } from "./f1-pdf.js";
import { generateF1ODS } from "./f1-ods.js";
import { generateF1XLSX } from "./f1-xlsx.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"), { showOds: true, showXlsx: true });

const api = createFormFactory({
  ...f1Config,
  generators: { pdf: generateF1PDF, ods: generateF1ODS, xlsx: generateF1XLSX },
});

api.init();

const tbody = document.getElementById("equip-tbody");
const form = document.getElementById("f1-form");
api.loadHistory(tbody, form);
