// Calcula el estado visible de un prestamo a partir de returned_at/due_date.
// No se persiste en BD: se deriva en el momento para siempre reflejar la fecha actual.
export function getPrestamoStatus(prestamo) {
  if (prestamo.returned_at) {
    return { id: "devuelto", label: "Devuelto" };
  }

  if (prestamo.due_date) {
    const due = new Date(prestamo.due_date);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (due < today) {
      return { id: "vencido", label: "Vencido" };
    }
  }

  return { id: "vigente", label: "Vigente" };
}

export const PRESTAMO_STATUS_STYLES = {
  vigente: "bg-blue-100 text-blue-700",
  vencido: "bg-red-100 text-red-700",
  devuelto: "bg-green-100 text-green-700",
};