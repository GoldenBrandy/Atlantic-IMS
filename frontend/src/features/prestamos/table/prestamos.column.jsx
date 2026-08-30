import { formatUserName } from "@/features/users/services/userService";
import { LOAN_TYPE_OPTIONS } from "../services/prestamoOptionsService";
import { getPrestamoStatus, PRESTAMO_STATUS_STYLES } from "../services/prestamoStatus";
import PrestamoRowActions from "../components/PrestamoRowActions";

// Traduce un id de opcion (tipo de prestamo) a su etiqueta visible.
function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

// Traduce un id de usuario a su nombre visible usando la lista ya cargada.
function findUserName(users, id) {
  const user = users.find((user) => String(user.id) === String(id));
  return user ? formatUserName(user) : id;
}

// Genera las columnas de la tabla. Recibe la lista de usuarios ya cargada
// (via API) para poder traducir los ids a nombre de forma sincrona.
export function getPrestamoColumns(users = []) {
  return [
    {
      id: "material",
      header: "Ítem(s) prestado(s)",
      cell: ({ row }) => {
        const names = (row.original.materials ?? []).map((material) => material.name);
        return names.length > 0 ? names.join(", ") : "-";
      },
    },
    {
      id: "requestingUser",
      header: "Usuario solicitante",
      cell: ({ row }) => findUserName(users, row.original.requesting_user),
    },
    {
      id: "lendingUser",
      header: "Usuario prestador",
      cell: ({ row }) => findUserName(users, row.original.lending_user),
    },
    {
      id: "ficha",
      header: "Ficha de aprendices",
      cell: ({ row }) => row.original.ficha ?? "-",
    },
    {
      id: "loanType",
      header: "Tipo de préstamo",
      cell: ({ row }) => findLabel(LOAN_TYPE_OPTIONS, row.original.loan_type),
    },
    {
      id: "startDate",
      header: "Fecha de salida",
      cell: ({ row }) => String(row.original.start_date ?? "").slice(0, 10),
    },
    {
      id: "dueDate",
      header: "Fecha de entrega",
      cell: ({ row }) => String(row.original.due_date ?? "").slice(0, 10),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = getPrestamoStatus(row.original);
        return (
          <span className={`rounded-full px-2 py-1 text-caption font-medium ${PRESTAMO_STATUS_STYLES[status.id]}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      accessorKey: "justification",
      header: "Justificación",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <PrestamoRowActions prestamo={row.original} users={users} />
      ),
    },
  ];
}