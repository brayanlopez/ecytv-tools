export function createHistoryManager(storageKey, maxEntries = 20) {
  function load() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function addEntry(data) {
    const history = load();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      savedAt: new Date().toISOString(),
      data,
    };
    history.unshift(entry);
    if (history.length > maxEntries) history.length = maxEntries;
    localStorage.setItem(storageKey, JSON.stringify(history));
    return history;
  }

  function removeEntry(id) {
    let history = load();
    history = history.filter((e) => e.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(history));
    return history;
  }

  function getEntry(id) {
    const history = load();
    return history.find((e) => e.id === id);
  }

  return { load, addEntry, removeEntry, getEntry };
}
