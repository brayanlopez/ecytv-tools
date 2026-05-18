import { describe, it, expect } from "vitest";
import { buildFilename } from "../../../js/forms/common/filename.js";

describe("buildFilename", () => {
  it("should build filename with all parts", () => {
    const result = buildFilename({
      formId: "f1",
      project: "Proyecto Final",
      username: "Juan Pérez",
      date: "2026-05-17",
    });
    expect(result).toBe("f1_proyecto_final_juan_perez_2026-05-17");
  });

  it("should sanitize special characters", () => {
    const result = buildFilename({
      formId: "f2",
      project: "Mi @Proyecto!",
      username: "Ana María López",
      date: "2026-05-17",
    });
    expect(result).toBe("f2_mi_proyecto_ana_maria_lopez_2026-05-17");
  });

  it("should use fallback for empty project", () => {
    const result = buildFilename({
      formId: "f3",
      project: "",
      username: "Test",
      date: "2026-05-17",
    });
    expect(result).toBe("f3_sin-nombre_test_2026-05-17");
  });

  it("should use fallback for empty username", () => {
    const result = buildFilename({
      formId: "f4",
      project: "Test",
      username: null,
      date: "2026-05-17",
    });
    expect(result).toBe("f4_test_sin-usuario_2026-05-17");
  });

  it("should use fallback for empty date", () => {
    const result = buildFilename({ formId: "f1", project: "Test", username: "User", date: "" });
    expect(result).toBe("f1_test_user_hoy");
  });

  it("should extract date part from ISO datetime", () => {
    const result = buildFilename({
      formId: "f1",
      project: "Test",
      username: "User",
      date: "2026-05-17T10:30:00",
    });
    expect(result).toBe("f1_test_user_2026-05-17");
  });

  it("should handle all parts empty/undefined", () => {
    const result = buildFilename({ formId: "f2", project: null, username: undefined, date: null });
    expect(result).toBe("f2_sin-nombre_sin-usuario_hoy");
  });

  it("should collapse multiple non-alphanumeric chars into single underscore", () => {
    const result = buildFilename({
      formId: "f1",
      project: "Hola  @#$  Mundo",
      username: "Test User",
      date: "2026-05-17",
    });
    expect(result).toBe("f1_hola_mundo_test_user_2026-05-17");
  });
});
