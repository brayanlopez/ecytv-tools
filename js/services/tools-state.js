import tools from "../../data/tools.js";

const STORAGE_KEY = "ecytv_favorites";

export function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function toggleFavorite(id) {
  const favorites = getFavorites();
  const idx = favorites.indexOf(id);
  if (idx > -1) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return { isFavorited: idx === -1, favorites };
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function getAllValues() {
  const categories = ["all", ...new Set(tools.map((t) => t.category))];
  const levels = ["all", ...new Set(tools.map((t) => t.level))];
  const platforms = ["all", ...new Set(tools.flatMap((t) => t.platform))].sort();
  const pricings = ["all", ...new Set(tools.map((t) => t.pricing))];
  return { categories, levels, platforms, pricings };
}

export function applyFilters(tool, activeFilters) {
  const { category, level, platform, pricing } = activeFilters;
  if (category !== "all" && tool.category !== category) {
    return false;
  }
  if (level !== "all" && tool.level !== level) {
    return false;
  }
  if (platform !== "all" && !tool.platform.includes(platform)) {
    return false;
  }
  if (pricing !== "all" && tool.pricing !== pricing) {
    return false;
  }
  return true;
}

export function getFilteredTools(filters, searchQuery) {
  const query = (searchQuery || "").toLowerCase();
  return tools.filter((tool) => {
    if (!applyFilters(tool, filters)) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      tool.category.toLowerCase().includes(query)
    );
  });
}
