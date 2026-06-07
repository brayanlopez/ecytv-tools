import qaList from "../../data/qa.js";
import { buildCategoryHtml } from "../components/qa-category.js";

let container = null;
let toggles = [];

function getCategories() {
  return [...new Set(qaList.map((item) => item.category))];
}

export function init() {
  container = document.getElementById("qa-list");
  if (!container) {
    return;
  }

  const categories = getCategories();

  container.innerHTML = categories
    .map((category) => {
      const items = qaList.filter((item) => item.category === category);
      return buildCategoryHtml(category, items);
    })
    .join("");

  container.querySelectorAll(".qa-question").forEach((btn) => {
    const handler = () => {
      const item = btn.closest(".qa-item");
      const isOpen = item.classList.contains("open");

      item.classList.toggle("open");
      btn.setAttribute("aria-expanded", !isOpen);
    };
    btn.addEventListener("click", handler);
    toggles.push({ btn, handler });
  });
}

export function destroy() {
  toggles.forEach(({ btn, handler }) => {
    btn.removeEventListener("click", handler);
  });
  toggles = [];
  container = null;
}
