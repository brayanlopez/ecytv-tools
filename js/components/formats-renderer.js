import formats from "../../data/formats.js";

export function renderFormats() {
  const container = document.getElementById("formats-grid");
  if (!container) return;

  container.innerHTML = formats
    .map(
      (f) => `
    <div class="format-card ${f.available ? "" : "coming-soon"}">
      <div class="format-card-header">
        <div class="format-card-icon">${f.icon.replace("<svg", '<svg aria-hidden="true"')}</div>
        <h3>${f.name}</h3>
      </div>
      <p>${f.description}</p>
      <a href="${f.url}" class="btn ${f.available ? "btn-primary" : "btn-disabled"}" ${f.available ? "" : 'tabindex="-1" aria-disabled="true"'}>${f.label}</a>
    </div>
  `,
    )
    .join("");
}
