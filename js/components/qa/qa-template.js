export function buildCategoryHtml(category, items) {
  return `
    <div class="qa-category">
      <h2 class="qa-category-title">${category}</h2>
      <div class="qa-items">
        ${items
          .map(
            (item) => `
          <div class="qa-item" data-id="${item.id}">
            <button class="qa-question" aria-expanded="false" id="qa-btn-${item.id}">
              <span>${item.question}</span>
              <svg class="qa-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <div class="qa-answer" role="region" aria-labelledby="qa-btn-${item.id}">
              <p>${item.answer}</p>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
