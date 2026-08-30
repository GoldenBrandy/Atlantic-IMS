// Genera el siguiente codigo secuencial de producto, ej. "PRD-0001",
// "PRD-0002"... Busca el numero mas alto entre los codigos existentes que
// siguen el patron PRD-#### y le suma 1 (ignora codigos con otro formato,
// como los que se hayan cargado manualmente antes de automatizar esto).
export function buildProductCode(nextNumber) {
  return `PRD-${String(nextNumber).padStart(4, "0")}`;
}

export function nextProductCode(existingCodes) {
  const highest = existingCodes.reduce((max, code) => {
    const match = /^PRD-(\d+)$/.exec(code || "");
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);
  return buildProductCode(highest + 1);
}
