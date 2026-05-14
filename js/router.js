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
    const hash = window.location.hash.slice(1) || "info";
    const sectionId = this.routes[hash] || "info-section";

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
    this.register("info", "info-section");
    this.register("tools", "tools-section");
    this.register("formats", "formats-section");
    this.register("docs", "docs-section");
    this.register("qa", "qa-section");
    const active = document.querySelector(".section.active");
    if (active) this.currentSection = active;
    this.handleRoute();
  }
}

export default new Router();
