import { createFormFactory } from "../common/form-factory.js";
import { f2Config } from "./f2-config.js";

const { saveFormToHistory, loadHistory, renderHistory, getHistoryManager } =
  createFormFactory(f2Config);

export { saveFormToHistory, loadHistory, renderHistory, getHistoryManager };
