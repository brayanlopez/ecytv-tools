import router from "./router.js";
import toolsRenderer from "./tools-renderer.js";

document.addEventListener("DOMContentLoaded", () => {
  toolsRenderer.init();
  router.init();
  initTheme();
});

function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const icon = toggle.querySelector(".theme-icon");

  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  icon.textContent = savedTheme === "dark" ? "☀️" : "🌙";

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    icon.textContent = next === "dark" ? "☀️" : "🌙";
  });
}
