import { HISTORIAL_MODULE_LABELS, HISTORIAL_ACTION_LABELS } from "../constants";

export const HISTORIAL_REPORT_FIELDS = [
    {
        key: "created_at",
        label: "Fecha",
        default: true,
        value: (log) => new Date(log.created_at).toLocaleString("es-CO"),
    },
    {
        key: "actor_email",
        label: "Usuario",
        default: true,
        value: (log) => log.actor_email ?? "Desconocido",
    },
    {
        key: "module",
        label: "Módulo",
        default: true,
        value: (log) => HISTORIAL_MODULE_LABELS[log.module] ?? log.module,
    },
    {
        key: "action",
        label: "Acción",
        default: true,
        value: (log) => HISTORIAL_ACTION_LABELS[log.action] ?? log.action,
    },
    { key: "entity_id", label: "Registro", default: false },
    { key: "description", label: "Descripción", default: true },
];