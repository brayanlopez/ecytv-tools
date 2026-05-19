import { vi, afterEach, beforeEach } from "vitest";

/**
 * Shared test setup - runs automatically before/after each test.
 * Configured via vitest.config.mjs setupFiles.
 */

const originalGlobals = {
  EcytvUI: undefined,
  JSZip: undefined,
  jspdf: undefined,
  PDFLib: undefined,
  fetch: globalThis.fetch,
  location: window.location,
};

beforeEach(() => {
  const localStorageMock = {};

  vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => localStorageMock[key] ?? null);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
    localStorageMock[key] = value;
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
    delete localStorageMock[key];
  });

  window.EcytvUI = { showSnackbar: vi.fn(), showModal: vi.fn() };
  Element.prototype.scrollIntoView = vi.fn();

  Object.defineProperty(window, "location", {
    value: { href: "", hash: "", assign: vi.fn() },
    writable: true,
  });
});

afterEach(() => {
  window.EcytvUI = originalGlobals.EcytvUI;
  window.JSZip = originalGlobals.JSZip;
  window.jspdf = originalGlobals.jspdf;
  window.PDFLib = originalGlobals.PDFLib;
  globalThis.fetch = originalGlobals.fetch;
  Object.defineProperty(window, "location", {
    value: originalGlobals.location,
    writable: true,
  });
  document.body.innerHTML = "";
});
