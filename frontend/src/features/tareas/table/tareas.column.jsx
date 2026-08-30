import { formatUserName } from "@/features/users/services/userService";
import { TASK_STATUS_OPTIONS, USER_TYPE_OPTIONS } from "../services/tareaOptionsService";
import TareaRowActions from "../components/TareaRowActions";

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function findNames(options, ids, users, useUserNames = false) {
  if (!ids?.length) return "-";
  return ids
    .map((id) => {
      if (!useUserNames) return findLabel(options, id);
      const user = users.find((user) => String(user.id) === String(id));
      return user ? formatUserName(user) : null;
    })
    .filter(Boolean)
    .join(", ");
}

// Muestra la fecha de finalización de cada usuario asignado, si hay más de uno.
function findUserEndDates(ids, endDates, users) {
  if (!ids?.length) return "-";
  return ids
    .map((id) => {
      const user = users.find((user) => String(user.id) === String(id));
      const name = user ? formatUserName(user) : id;
      const date = endDates?.[id] ? String(endDates[id]).slice(0, 10) : "-";
      return `${name}: ${date}`;
    })
    .join(", ");
}

// Genera las columnas de la tabla. Recibe la lista de usuarios ya cargada
// (via API) para poder traducir assigned_users -> nombres de forma sincrona.
export function getTareaColumns(users = []) {
  return [
    {
      accessorKey: "task_name",
      header: "Nombre de la tarea",
    },
    {
      id: "assignedUsers",
      header: "Usuario(s)",
      cell: ({ row }) => findNames(null, row.original.assigned_users, users, true),
    },
    {
      id: "assignedUserTypes",
      header: "Tipo(s) de usuario",
      cell: ({ row }) => findNames(USER_TYPE_OPTIONS, row.original.assigned_user_types, users),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => findLabel(TASK_STATUS_OPTIONS, row.original.status),
    },
    {
      id: "startDate",
      header: "Fecha inicio",
      cell: ({ row }) => String(row.original.start_date ?? "").slice(0, 10),
    },
    {
      id: "endDate",
      header: "Fecha fin",
      cell: ({ row }) => {
        const tarea = row.original;
        if ((tarea.assigned_users?.length ?? 0) > 1) {
          return findUserEndDates(tarea.assigned_users, tarea.assigned_user_end_dates, users);
        }
        return String(tarea.end_date ?? "").slice(0, 10);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <TareaRowActions tarea={row.original} users={users} />,
    },
  ];
}
