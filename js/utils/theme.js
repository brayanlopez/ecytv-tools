export function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const icon = toggle.querySelector(".theme-icon");

  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  icon.textContent = savedTheme === "dark" ? "☀️" : "🌙";
  icon.setAttribute("aria-hidden", "true");

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    icon.textContent = next === "dark" ? "☀️" : "🌙";
  });
}

export function restoreTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}
