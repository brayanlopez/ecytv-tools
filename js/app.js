import router from "./router.js";
import toolsRenderer from "./components/tools/tools-renderer.js";
import { renderInfoCards } from "./components/info-renderer.js";
import docsRenderer from "./components/docs/docs-renderer.js";
import qaRenderer from "./components/qa/qa-renderer.js";
import { renderFormats } from "./components/formats-renderer.js";
import { initTheme } from "./utils/theme.js";
import { initHamburger } from "./utils/hamburger.js";

document.addEventListener("DOMContentLoaded", () => {
  renderInfoCards();
  toolsRenderer.init();
  docsRenderer.init();
  qaRenderer.init();
  renderFormats();
  router.init();
  initTheme();
  initHamburger();
});
