function sanitize(str, fallback) {
  if (!str || !str.trim()) {
    return fallback;
  }
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function toDateStr(dateVal) {
  if (!dateVal) {
    return "hoy";
  }
  return dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
}

export function buildFilename({ formId, project, username, date }) {
  const p = sanitize(project, "sin-nombre");
  const u = sanitize(username, "sin-usuario");
  const d = toDateStr(date);
  return formId + "_" + p + "_" + u + "_" + d;
}
