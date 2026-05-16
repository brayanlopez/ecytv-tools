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
