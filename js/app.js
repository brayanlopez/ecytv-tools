import router from "./router.js";
import toolsRenderer from "./tools-renderer.js";

document.addEventListener("DOMContentLoaded", () => {
  toolsRenderer.init();
  router.init();
});
