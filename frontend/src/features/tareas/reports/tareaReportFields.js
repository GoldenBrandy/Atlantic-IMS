import { TASK_STATUS_OPTIONS } from "../services/tareaOptionsService";

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

export const TAREA_REPORT_FIELDS = [
  { key: "task_name", label: "Nombre de la tarea", default: true },
  { key: "status", label: "Estado", default: true, value: (t) => findLabel(TASK_STATUS_OPTIONS, t.status) },
  { key: "start_date", label: "Fecha inicio", default: true, value: (t) => (t.start_date ? String(t.start_date).slice(0, 10) : "") },
  { key: "end_date", label: "Fecha fin", default: true, value: (t) => (t.end_date ? String(t.end_date).slice(0, 10) : "") },
  { key: "description", label: "Descripción", default: false },
];
