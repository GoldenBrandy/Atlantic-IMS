import { HISTORIAL_MODULE_LABELS, HISTORIAL_ACTION_LABELS } from "../constants";

export function getHistorialColumns() {
    return [
        {
            id: "created_at",
            header: "Fecha",
            cell: ({ row }) => new Date(row.original.created_at).toLocaleString("es-CO"),
        },
        {
            id: "actor_email",
            header: "Usuario",
            cell: ({ row }) => row.original.actor_email ?? "Desconocido",
        },
        {
            id: "module",
            header: "Módulo",
            cell: ({ row }) => HISTORIAL_MODULE_LABELS[row.original.module] ?? row.original.module,
        },
        {
            id: "action",
            header: "Acción",
            cell: ({ row }) => HISTORIAL_ACTION_LABELS[row.original.action] ?? row.original.action,
        },
        {
            accessorKey: "entity_id",
            header: "Registro",
        },
        {
            accessorKey: "description",
            header: "Descripción",
        },
    ];
}