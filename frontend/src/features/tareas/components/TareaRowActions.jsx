import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal } from "@/shared";
import { formatUserName } from "@/features/users/services/userService";
import { TASK_STATUS_OPTIONS, USER_TYPE_OPTIONS } from "../services/tareaOptionsService";

// Traduce ids de opciones (estado) a su etiqueta visible.
function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

// Traduce un arreglo de ids (usuarios o tipos de usuario) a una lista de nombres.
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

export default function TareaRowActions({ tarea, users = [] }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/tareas/${tarea.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar tarea", tarea.id);
  };

  const iconButtonClasses = "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" aria-label="Ver tarea" onClick={() => setIsViewOpen(true)} className={iconButtonClasses}>
        <Eye size={18} />
      </button>

      <button type="button" aria-label="Editar tarea" onClick={handleEdit} className={iconButtonClasses}>
        <Pencil size={18} />
      </button>

      <Dropdown>
        <DropdownTrigger>
          <button type="button" aria-label="Acciones de tarea" className={iconButtonClasses}>
            <EllipsisVertical size={18} />
          </button>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
          <DropdownItem onClick={handleDelete}>Eliminar</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={tarea.task_name}
        fields={[
          { label: "Usuario(s)", value: findNames(null, tarea.assigned_users, users, true) },
          { label: "Tipo(s) de usuario", value: findNames(USER_TYPE_OPTIONS, tarea.assigned_user_types, users) },
          { label: "Estado", value: findLabel(TASK_STATUS_OPTIONS, tarea.status) },
          { label: "Fecha inicio", value: String(tarea.start_date ?? "").slice(0, 10) },
          {
            label: tarea.assigned_users?.length > 1 ? "Fecha fin por usuario" : "Fecha fin",
            value:
              tarea.assigned_users?.length > 1
                ? findUserEndDates(tarea.assigned_users, tarea.assigned_user_end_dates, users)
                : String(tarea.end_date ?? "").slice(0, 10),
          },
          { label: "Descripción", value: tarea.description },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}
