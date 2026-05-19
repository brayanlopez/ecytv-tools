class Router {
  constructor() {
    this.routes = {};
    this.pageModules = {};
    this.currentSection = null;
    this.currentPage = null;
    this.currentHash = null;
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  register(path, sectionId) {
    this.routes[path] = sectionId;
  }

  registerPage(path, sectionId, pageModule) {
    this.routes[path] = sectionId;
    this.pageModules[path] = pageModule;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || "info";
    if (hash === this.currentHash) return;
    this.currentHash = hash;

    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }

    const sectionId = this.routes[hash] || this.routes["info"];
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

    const pageModule = this.pageModules[hash];
    if (pageModule && pageModule.init) {
      this.currentPage = pageModule;
      pageModule.init();
    } else {
      this.currentPage = null;
    }
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
