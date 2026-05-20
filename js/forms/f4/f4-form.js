import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { f4Config } from "./f4-config.js";
import { generateF4PDF } from "./f4-pdf.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"));

const api = createFormFactory({
  ...f4Config,
  generators: { pdf: generateF4PDF },
});

api.init();

const tbody = document.getElementById("sala-tbody");
const form = document.getElementById("f4-form");
api.loadHistory(tbody, form);
