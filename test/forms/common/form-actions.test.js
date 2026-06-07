import { describe, it, expect } from "vitest";
import { renderFormActions } from "../../../js/forms/common/form-actions.js";

describe("renderFormActions", () => {
  it("should do nothing when container is null", () => {
    expect(() => renderFormActions(null)).not.toThrow();
    expect(() => renderFormActions(undefined)).not.toThrow();
  });

  it("should render PDF and advanced menu by default", () => {
    const container = document.createElement("div");
    renderFormActions(container);
    expect(container.querySelector("#btn-download")).toBeTruthy();
    expect(container.querySelector("#btn-pdf")).toBeTruthy();
    expect(container.querySelector("#btn-ods")).toBeFalsy();
    expect(container.querySelector("#btn-xlsx")).toBeFalsy();
    expect(container.querySelector("#btn-advanced")).toBeTruthy();
    expect(container.querySelector("#btn-export-json")).toBeTruthy();
    expect(container.querySelector("#btn-export-yaml")).toBeTruthy();
    expect(container.querySelector("#btn-import")).toBeTruthy();
  });

  it("should include ODS button when showOds is true", () => {
    const container = document.createElement("div");
    renderFormActions(container, { showOds: true });
    expect(container.querySelector("#btn-ods")).toBeTruthy();
    expect(container.querySelector("#btn-xlsx")).toBeFalsy();
  });

  it("should include XLSX button when showXlsx is true", () => {
    const container = document.createElement("div");
    renderFormActions(container, { showXlsx: true });
    expect(container.querySelector("#btn-ods")).toBeFalsy();
    expect(container.querySelector("#btn-xlsx")).toBeTruthy();
  });

  it("should include both ODS and XLSX when both are true", () => {
    const container = document.createElement("div");
    renderFormActions(container, { showOds: true, showXlsx: true });
    expect(container.querySelector("#btn-ods")).toBeTruthy();
    expect(container.querySelector("#btn-xlsx")).toBeTruthy();
  });

  it("should render download SVG and chevron icons", () => {
    const container = document.createElement("div");
    renderFormActions(container);
    const downloadBtn = container.querySelector("#btn-download");
    expect(downloadBtn.innerHTML).toContain("<svg");
    expect(downloadBtn.innerHTML).toContain("Descargar");
  });

  it("should set aria attributes on dropdown buttons", () => {
    const container = document.createElement("div");
    renderFormActions(container);
    expect(container.querySelector("#btn-download").getAttribute("aria-haspopup")).toBe("true");
    expect(container.querySelector("#btn-download").getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector("#btn-advanced").getAttribute("aria-haspopup")).toBe("true");
  });
});
