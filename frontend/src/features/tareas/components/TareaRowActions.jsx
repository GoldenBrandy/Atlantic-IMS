import { EllipsisVertical, Eye, Pencil, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal, IconButton } from "@/shared";
import { formatUserName } from "@/features/users/services/userService";
import { getCurrentUser } from "@/features/auth";
import { TASK_STATUS_OPTIONS, USER_TYPE_OPTIONS } from "../services/tareaOptionsService";
import { viewTarea, verifyTarea } from "../services/tareaService";
import { sileo } from "sileo";

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

export default function TareaRowActions({ tarea, users = [], onChange }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const isAssignee = (tarea.assigned_users ?? []).some((id) => String(id) === String(currentUser?.id));
  const isAssigner = tarea.assigned_by != null && String(tarea.assigned_by) === String(currentUser?.id);
  const canVerify = isAssigner && tarea.status === "completada" && !tarea.verified_at;

  const handleEdit = () => {
    navigate(`/dashboard/tareas/${tarea.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar tarea", tarea.id);
  };

  // El asignado (no el asignador) abre la tarea: se avisa a quien la asigno.
  const handleView = () => {
    setIsViewOpen(true);
    if (isAssignee && !isAssigner) {
      viewTarea(tarea.id).catch(console.error);
    }
  };

  const handleVerify = async () => {
    try {
      await verifyTarea(tarea.id);
      sileo.success({ title: "Tarea verificada", description: "Se notificó a los asignados" });
      onChange?.();
    } catch (err) {
      sileo.error({ title: "No se pudo verificar la tarea", description: err?.message || String(err) });
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver tarea" variant="ghost" hitSize={36} iconSize={18} onClick={handleView}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar tarea" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      {canVerify && (
        <IconButton ariaLabel="Verificar tarea" variant="ghost" hitSize={36} iconSize={18} onClick={handleVerify}>
          <BadgeCheck size={18} />
        </IconButton>
      )}

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de tarea" variant="ghost" hitSize={36} iconSize={18}>
            <EllipsisVertical size={18} />
          </IconButton>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
          {canVerify && <DropdownItem onClick={handleVerify}>Verificar</DropdownItem>}
          <DropdownItem onClick={handleDelete}>Eliminar</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={tarea.task_name}
        fields={[
          { label: "Usuario(s)", value: findNames(null, tarea.assigned_users, users, true) },
          { label: "Asignado por", value: findNames(null, tarea.assigned_by ? [tarea.assigned_by] : [], users, true) },
          { label: "Tipo(s) de usuario", value: findNames(USER_TYPE_OPTIONS, tarea.assigned_user_types, users) },
          { label: "Estado", value: findLabel(TASK_STATUS_OPTIONS, tarea.status) },
          { label: "Progreso", value: `${tarea.progress ?? 0}%` },
          { label: "Verificada", value: tarea.verified_at ? `Sí (${String(tarea.verified_at).slice(0, 10)})` : "No" },
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
