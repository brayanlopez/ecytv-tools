import { createFormFactory } from "../common/form-factory.js";
import { f1Config } from "./f1-config.js";

const { saveFormToHistory, loadHistory, renderHistory, getHistoryManager } =
  createFormFactory(f1Config);

export { saveFormToHistory, loadHistory, renderHistory, getHistoryManager };
