import { createFormFactory } from "../common/form-factory.js";
import { f4Config } from "./f4-config.js";

const { saveFormToHistory, loadHistory, renderHistory, getHistoryManager } =
  createFormFactory(f4Config);

export { saveFormToHistory, loadHistory, renderHistory, getHistoryManager };
