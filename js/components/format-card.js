const chevronRight = `<svg class="format-card-chevron" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

export function buildFormatCard(f) {
  const tag = f.available ? "a" : "div";
  const hrefAttr = f.available ? `href="${f.url}"` : "";
  const disabledAttr = f.available ? "" : `aria-disabled="true"`;

  return `
    <${tag} ${hrefAttr} ${disabledAttr} class="format-card ${f.available ? "" : "coming-soon"}">
      <div class="format-card-header">
        <div class="format-card-icon">${f.icon.replace("<svg", '<svg aria-hidden="true"')}</div>
        <div class="format-card-body">
          <span class="format-card-title">${f.name}</span>
          <span class="format-card-desc">${f.description}</span>
        </div>
      </div>
      ${f.available ? chevronRight : ""}
    </${tag}>
  `;
}

export function buildFormatSection(title, items) {
  if (items.length === 0) {
    return "";
  }
  return `
    <div class="format-group">
      <h3 class="formats-subheading">${title}</h3>
      <div class="format-link-list">
        ${items.map(buildFormatCard).join("")}
      </div>
    </div>
  `;
}
