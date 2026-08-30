// Opciones estaticas para los selects/multiselects del formulario de tareas.
// Se exportan como constantes planas para poder traducir id -> label de
// forma sincrona en la tabla de listado y en el modal de detalle.

export const TASK_STATUS_OPTIONS = [
  { id: "pendiente", label: "Pendiente" },
  { id: "en_progreso", label: "En progreso" },
  { id: "completada", label: "Completada" },
  { id: "cancelada", label: "Cancelada" },
];

export const USER_TYPE_OPTIONS = [
  { id: "administrador", label: "Administrador" },
  { id: "instructor", label: "Instructor" },
  { id: "aprendiz", label: "Aprendiz" },
  { id: "monitor", label: "Monitor" },
  { id: "invitado", label: "Invitado" },
];
