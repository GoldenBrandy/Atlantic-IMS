import { LOAN_TYPE_OPTIONS } from "../services/prestamoOptionsService";
import { getPrestamoStatus } from "../services/prestamoStatus";

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

export const PRESTAMO_REPORT_FIELDS = [
  { key: "materials", label: "Ítem(s) prestado(s)", default: true, value: (p) => (p.materials ?? []).map((m) => m.name).join(", ") },
  { key: "ficha", label: "Ficha de aprendices", default: true },
  { key: "loan_type", label: "Tipo de préstamo", default: true, value: (p) => findLabel(LOAN_TYPE_OPTIONS, p.loan_type) },
  { key: "start_date", label: "Fecha de salida", default: true, value: (p) => (p.start_date ? String(p.start_date).slice(0, 10) : "") },
  { key: "due_date", label: "Fecha de entrega", default: true, value: (p) => (p.due_date ? String(p.due_date).slice(0, 10) : "") },
  { key: "status", label: "Estado", default: true, value: (p) => getPrestamoStatus(p).label },
  { key: "justification", label: "Justificación", default: false },
];