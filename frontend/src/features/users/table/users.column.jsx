import { Switch } from "@/shared";
import UserRowActions from "../components/UserRowActions";

// Arma el nombre completo a partir de las partes que existan.
function fullName(user) {
  return [user.user_name, user.last_name_1].filter(Boolean).join(" ");
}

// Traduce group_id -> nombre del grupo usando la lista ya cargada.
function findGroupName(groups, groupId) {
  if (!groupId) return "-";
  return groups.find((group) => String(group.group_id) === String(groupId))?.group_name ?? "-";
}

// Genera las columnas de la tabla. Recibe la lista de grupos ya cargada
// (via API) para poder traducir group_id -> "Tipo de usuario" de forma sincrona,
// y onToggleStatus(user, nextValue) para el switch individual de estado
// (solo se pasa si el usuario logueado es super administrador).
export function getUserColumns(groups = [], onToggleStatus) {
  return [
    {
      id: "fullName",
      header: "Nombre",
      cell: ({ row }) => fullName(row.original),
    },
    {
      accessorKey: "document_type",
      header: "Tipo de documento",
    },
    {
      id: "group",
      header: "Tipo de usuario",
      cell: ({ row }) => {
        const groupName = findGroupName(groups, row.original.group_id);
        return groupName === "-" ? <span className="text-neutral-400">-</span> : groupName;
      },
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={user.is_active}
              disabled={!onToggleStatus}
              onChange={(value) => onToggleStatus?.(user, value)}
            />
            <span className={`text-caption font-medium ${user.is_active ? "text-green-700" : "text-neutral-400"}`}>
              {user.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "user_email",
      header: "Correo",
    },
    {
      id: "startDate",
      header: "Fecha de inicio",
      cell: ({ row }) => {
        const value = row.original.start_date ? String(row.original.start_date).slice(0, 10) : null;
        return value ?? <span className="text-neutral-400">-</span>;
      },
    },
    {
      id: "endDate",
      header: "Fecha fin",
      cell: ({ row }) => {
        const value = row.original.end_date ? String(row.original.end_date).slice(0, 10) : null;
        return value ?? <span className="text-neutral-400">-</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <UserRowActions user={row.original} groups={groups} />,
    },
  ];
}
