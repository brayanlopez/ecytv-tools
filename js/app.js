import router from "./router.js";
import { toolsRendererInstance as toolsRenderer } from "./tools-renderer.js";

document.addEventListener("DOMContentLoaded", () => {
  router.register("tools", "tools-section");
  router.register("formats", "formats-section");
  router.register("info", "info-section");
  router.register("docs", "docs-section");

  toolsRenderer.init();
  router.init();
});
