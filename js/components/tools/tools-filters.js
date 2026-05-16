import tools from "../../../data/tools.js";

export function getAllValues() {
  const categories = ["all", ...new Set(tools.map((t) => t.category))];
  const levels = ["all", ...new Set(tools.map((t) => t.level))];
  const platforms = [
    "all",
    ...new Set(tools.flatMap((t) => t.platform)),
  ].sort();
  const pricings = ["all", ...new Set(tools.map((t) => t.pricing))];
  return { categories, levels, platforms, pricings };
}

export function applyFilters(tool, activeFilters) {
  const { category, level, platform, pricing } = activeFilters;

  if (category !== "all" && tool.category !== category) return false;
  if (level !== "all" && tool.level !== level) return false;
  if (platform !== "all" && !tool.platform.includes(platform)) return false;
  if (pricing !== "all" && tool.pricing !== pricing) return false;

  return true;
}
