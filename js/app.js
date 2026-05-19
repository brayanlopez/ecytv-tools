import router from "./router.js";
import * as infoPage from "./pages/info-page.js";
import * as formatsPage from "./pages/formats-page.js";
import * as toolsPage from "./pages/tools-page.js";
import * as docsPage from "./pages/docs-page.js";
import * as qaPage from "./pages/qa-page.js";
import { initTheme } from "./utils/theme.js";
import { initHamburger } from "./utils/hamburger.js";

document.addEventListener("DOMContentLoaded", () => {
  router.registerPage("info", "info-section", infoPage);
  router.registerPage("tools", "tools-section", toolsPage);
  router.registerPage("formats", "formats-section", formatsPage);
  router.registerPage("docs", "docs-section", docsPage);
  router.registerPage("qa", "qa-section", qaPage);
  router.init();
  initTheme();
  initHamburger();
});
