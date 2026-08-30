// Genera un codigo corto (mayusculas, sin acentos ni espacios) a partir del
// nombre del grupo/rol, ej. "Administrador" -> "ADMIN", "Instructor" -> "INSTR".
// normalize("NFD") separa los acentos de la letra base; al filtrar solo a-zA-Z
// los acentos (que quedan como marcas Unicode aparte) se descartan solos.
export function slugifyGroupCode(name) {
  return (name || "")
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 5);
}
