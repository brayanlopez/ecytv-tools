import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { f3Config } from "./f3-config.js";
import { generateF3PDF } from "./f3-pdf.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"));

const api = createFormFactory({
  ...f3Config,
  generators: { pdf: generateF3PDF },
});

api.init();

const tbody = document.getElementById("equip-tbody");
const form = document.getElementById("f3-form");
api.loadHistory(tbody, form);
