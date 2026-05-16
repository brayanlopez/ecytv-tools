export { serializeYAML, parseYAML };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, filename + ".json");
}

export function downloadYAML(data, filename) {
  const yaml = serializeYAML(data);
  const blob = new Blob([yaml], { type: "text/yaml" });
  downloadBlob(blob, filename + ".yaml");
}

export function validateImportData(data, requiredKeys, formLabel) {
  if (!data) return false;
  const hasKey = requiredKeys.some((key) => key in data);
  if (!hasKey) {
    throw new Error(`El archivo no contiene datos válidos de ${formLabel}.`);
  }
  return true;
}

export function importFromFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.yaml,.yml";
    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const ext = file.name.split(".").pop().toLowerCase();
        if (ext === "json") {
          resolve(JSON.parse(text));
        } else {
          resolve(parseYAML(text));
        }
      } catch {
        reject(new Error("Formato de archivo no válido. Usa JSON o YAML."));
      }
    });
    input.click();
  });
}

function serializeYAML(data) {
  const lines = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(key + ":");
      for (const item of value) {
        if (typeof item === "object" && item !== null) {
          lines.push("  -");
          for (const [k, v] of Object.entries(item)) {
            lines.push("    " + k + ": " + yamlValue(v));
          }
        } else {
          lines.push("  - " + yamlValue(item));
        }
      }
    } else if (typeof value === "object" && value !== null) {
      lines.push(key + ":");
      for (const [k, v] of Object.entries(value)) {
        lines.push("  " + k + ": " + yamlValue(v));
      }
    } else {
      lines.push(key + ": " + yamlValue(value));
    }
  }
  return lines.join("\n") + "\n";
}

function yamlValue(value) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (value === null || value === undefined) return "null";
  const str = String(value);
  if (
    /[:\[\]#{}|>*!&%@`\n"]/.test(str) ||
    str === "" ||
    str === "true" ||
    str === "false" ||
    str === "null" ||
    /^\d/.test(str)
  ) {
    return (
      '"' +
      str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") +
      '"'
    );
  }
  return str;
}

function parseYAML(text) {
  const lines = text.split("\n");
  const result = {};
  const stack = [{ obj: result }];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = raw.search(/\S|$/);

    while (stack.length > 1 && indent < stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (trimmed === "-") {
      const nextRaw = i + 1 < lines.length ? lines[i + 1] : null;
      if (nextRaw && nextRaw.search(/\S|$/) > indent + 1) {
        const obj = {};
        let arr = parent.obj;
        if (!Array.isArray(arr)) {
          arr = [];
          const lastKey = Object.keys(parent.obj).find(
            (k) => parent.obj[k] === arr,
          );
          if (!lastKey) {
            const topObj = {};
            i++;
            stack.push({ obj: topObj, indent });
            continue;
          }
        }
        arr.push(obj);
        stack.push({ obj, indent: indent + 2 });
        continue;
      }
      if (Array.isArray(parent.obj)) {
        parent.obj.push({});
        stack.push({
          obj: parent.obj[parent.obj.length - 1],
          indent: indent + 2,
        });
      }
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const val = trimmed.slice(2).trim();
      const colonIdx = val.indexOf(": ");
      if (colonIdx > 0) {
        const obj = {};
        obj[val.slice(0, colonIdx).trim()] = parseYAMLValue(
          val.slice(colonIdx + 2).trim(),
        );
        if (Array.isArray(parent.obj)) {
          parent.obj.push(obj);
          stack.push({ obj, indent: indent + 2 });
        }
        continue;
      }
      if (Array.isArray(parent.obj)) {
        parent.obj.push(parseYAMLValue(val));
      }
      continue;
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const rest = trimmed.slice(colonIdx + 1).trim();

    if (rest === "" || rest === "|") {
      const peekRaw = i + 1 < lines.length ? lines[i + 1] : null;
      if (peekRaw && peekRaw.search(/\S|$/) > indent) {
        const peekTrimmed = peekRaw.trim();

        if (peekTrimmed === "-" || peekTrimmed.startsWith("- ")) {
          const arr = [];
          parent.obj[key] = arr;
          stack.push({ obj: arr, indent: indent + 2 });
          continue;
        }

        const nestedObj = {};
        parent.obj[key] = nestedObj;
        stack.push({ obj: nestedObj, indent: indent + 2 });
        continue;
      }
      parent.obj[key] = "";
      continue;
    }

    parent.obj[key] = parseYAMLValue(rest);
  }

  return result;
}

function parseYAMLValue(str) {
  if (str === "true") return true;
  if (str === "false") return false;
  if (str === "null" || str === "~") return null;
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  if (/^\d+\.\d+$/.test(str)) return parseFloat(str);
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    return str
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  return str;
}
