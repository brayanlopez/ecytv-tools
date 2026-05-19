import formats from "../../data/formats.js";

function renderCard(f) {
  return `
    <div class="format-card ${f.available ? "" : "coming-soon"}">
      <div class="format-card-header">
        <div class="format-card-icon">${f.icon.replace("<svg", '<svg aria-hidden="true"')}</div>
        <h3>${f.name}</h3>
      </div>
      <p>${f.description}</p>
      <a href="${f.url}" class="btn ${f.available ? "btn-primary" : "btn-disabled"}" ${f.available ? "" : 'tabindex="-1" aria-disabled="true"'}>${f.label}</a>
    </div>
  `;
}

function renderSection(title, items) {
  if (items.length === 0) return "";
  return `
    <h3 class="formats-subheading">${title}</h3>
    <div class="formats-grid">
      ${items.map(renderCard).join("")}
    </div>
  `;
}

export function renderFormats() {
  const container = document.getElementById("formats-grid");
  if (!container) return;

  const forms = formats.filter((f) => f.type === "form");
  const tools = formats.filter((f) => f.type === "tool");

  container.innerHTML =
    renderSection("Generar Formatos", forms) + renderSection("Herramientas Útiles", tools);
}
