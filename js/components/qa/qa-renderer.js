import qaList from "../../../data/qa.js";
import { buildCategoryHtml } from "./qa-template.js";

class QaRenderer {
  constructor() {
    this.container = document.getElementById("qa-list");
  }

  getCategories() {
    return [...new Set(qaList.map((item) => item.category))];
  }

  render() {
    if (!this.container) return;
    const categories = this.getCategories();

    this.container.innerHTML = categories
      .map((category) => {
        const items = qaList.filter((item) => item.category === category);
        return buildCategoryHtml(category, items);
      })
      .join("");

    this.container.querySelectorAll(".qa-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".qa-item");
        const isOpen = item.classList.contains("open");

        item.classList.toggle("open");
        btn.setAttribute("aria-expanded", !isOpen);
      });
    });
  }

  init() {
    this.render();
  }
}

export { QaRenderer };

const qaRendererInstance = new QaRenderer();
export default qaRendererInstance;
