import { buildFilename } from "../common/filename.js";

export async function generateF1XLSX(data) {
  try {
    const resp = await fetch("data/f1-template.xlsx");
    if (!resp.ok) {
      throw new Error("No se pudo cargar la plantilla XLSX");
    }
    const buf = await resp.arrayBuffer();

    const wb = XLSX.read(buf, { type: "array", cellStyles: true });
    const ws = wb.Sheets[wb.SheetNames[0]];

    const {
      proyecto,
      asignatura,
      responsable,
      tiun,
      lugar,
      celular,
      "tipo-prestamo": tipoPrestamo,
      "fecha-retiro": fechaRetiro = "",
      "fecha-entrega": fechaEntrega = "",
      observaciones,
      docente,
      equipos: equipData,
    } = data;

    function setCell(addr, val) {
      const existing = ws[addr];
      if (existing) {
        existing.v = val;
        existing.t = "s";
      } else {
        ws[addr] = { v: val, t: "s" };
      }
    }

    setCell("C7", proyecto);
    setCell("G7", asignatura);
    setCell("C8", responsable);
    setCell("G8", tiun);
    setCell("C9", lugar);
    setCell("G9", celular);

    if (tipoPrestamo === "Interno") {
      setCell("D10", "X");
      setCell("G10", "");
    } else {
      setCell("D10", "");
      setCell("G10", "X");
    }

    const retiro = fechaRetiro.split("T");
    const entrega = fechaEntrega.split("T");
    if (retiro[0]) {
      setCell("C12", retiro[0]);
    }
    if (retiro[1]) {
      setCell("C13", retiro[1]);
    }
    if (entrega[0]) {
      setCell("G12", entrega[0]);
    }
    if (entrega[1]) {
      setCell("G13", entrega[1]);
    }

    for (let i = 0; i < Math.min(14, equipData.length); i++) {
      const r = 17 + i;
      setCell("B" + r, equipData[i].item);
      setCell("C" + r, equipData[i].nombre);
      setCell("H" + r, equipData[i].consecutivo);
    }
    for (let i = equipData.length; i < 14; i++) {
      const r = 17 + i;
      setCell("B" + r, "");
      setCell("C" + r, "");
      setCell("H" + r, "");
    }

    setCell("C31", observaciones);
    setCell("C32", docente);
    setCell("G32", "_________________________");
    setCell("E37", "NOMBRE: " + responsable);
    setCell("E38", "C.C.: " + tiun);

    if (equipData.length > 14) {
      for (let i = 14; i < equipData.length; i++) {
        const r = 40 + i - 14;
        setCell("B" + r, equipData[i].item);
        setCell("C" + r, equipData[i].nombre);
        setCell("H" + r, equipData[i].consecutivo);
      }
    }

    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      buildFilename({ formId: "f1", project: proyecto, username: responsable, date: fechaRetiro }) +
      ".xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    window.EcytvUI.showSnackbar("Error al generar el archivo XLSX: " + err.message, "error");
  }
}
