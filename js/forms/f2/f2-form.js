import { restoreTheme } from "../../utils/theme.js";
import { createFormFactory } from "../common/form-factory.js";
import { renderFormActions } from "../common/form-actions.js";
import { f2Config } from "./f2-config.js";
import { generateF2PDF } from "./f2-pdf.js";

restoreTheme();

renderFormActions(document.getElementById("form-actions-root"));

const api = createFormFactory({
  ...f2Config,
  generators: { pdf: generateF2PDF },
});

api.init();

const form = document.getElementById("f2-form");
api.loadHistory(null, form);
