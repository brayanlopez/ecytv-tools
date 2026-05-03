class Router {
  constructor() {
    this.routes = {};
    this.currentSection = null;
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  register(path, sectionId) {
    this.routes[path] = sectionId;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || "tools";
    const sectionId = this.routes[hash] || "tools";

    if (this.currentSection) {
      this.currentSection.classList.remove("active");
    }

    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("active");
      this.currentSection = section;
    }

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${hash}`);
    });
  }

  init() {
    this.handleRoute();
  }
}

export default new Router();
