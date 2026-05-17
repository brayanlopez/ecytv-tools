import { createFormFactory } from "../common/form-factory.js";
import { f3Config } from "./f3-config.js";

const { saveFormToHistory, loadHistory, renderHistory, getHistoryManager } =
  createFormFactory(f3Config);

export { saveFormToHistory, loadHistory, renderHistory, getHistoryManager };
