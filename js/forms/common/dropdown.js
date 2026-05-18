export function initDropdown(btnId, menuId) {
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);

  if (!btn || !menu) return { close: () => {} };

  function close() {
    menu.classList.remove("show");
    btn.classList.remove("active");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains("show");
    menu.classList.toggle("show");
    btn.classList.toggle("active");
    btn.setAttribute("aria-expanded", !isOpen);
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!menu.classList.contains("show")) {
        menu.classList.add("show");
        btn.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
      }
      const items = menu.querySelectorAll(".dropdown-item");
      if (items.length > 0) items[0].focus();
    }
  });

  menu.addEventListener("keydown", (e) => {
    const items = Array.from(menu.querySelectorAll(".dropdown-item"));
    const currentIndex = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIndex + 1) % items.length;
      items[next].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIndex - 1 + items.length) % items.length;
      items[prev].focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
      btn.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement && items.includes(document.activeElement)) {
        e.preventDefault();
        document.activeElement.click();
      }
    }
  });

  document.addEventListener("click", close);
  menu.addEventListener("click", close);

  return { close };
}
