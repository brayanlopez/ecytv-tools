export function initHamburger() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-controls", "nav-links");

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.focus();
    }
  });
}
