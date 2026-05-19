import docs from "../../data/docs.js";

export function getDocCategories() {
  return ["all", ...new Set(docs.map((d) => d.category))];
}

export function getFilteredDocs(category) {
  if (category === "all") return docs;
  return docs.filter((d) => d.category === category);
}
