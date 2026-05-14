import qaList from "../data/qa.js";

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
      .map(
        (category) => `
      <div class="qa-category">
        <h2 class="qa-category-title">${category}</h2>
        <div class="qa-items">
          ${qaList
            .filter((item) => item.category === category)
            .map(
              (item) => `
            <div class="qa-item" data-id="${item.id}">
              <button class="qa-question" aria-expanded="false">
                <span>${item.question}</span>
                <svg class="qa-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <div class="qa-answer">
                <p>${item.answer}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `,
      )
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
