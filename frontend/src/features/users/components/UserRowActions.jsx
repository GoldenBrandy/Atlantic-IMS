import { EllipsisVertical, Eye, Pencil, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  ViewDetailsModal,
} from "@/shared";
import { isSuperUser } from "@/features/auth";

// Traduce group_id -> nombre del grupo usando la lista ya cargada.
function findGroupName(groups, groupId) {
  if (!groupId) return null;
  return groups.find((group) => String(group.group_id) === String(groupId))?.group_name ?? null;
}

export default function UserRowActions({ user, groups = [] }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
  const canEdit = isSuperUser();
  const isPastEndDate = Boolean(user.end_date) && new Date(user.end_date) < new Date();
  const needsRenewal = !user.is_active || isPastEndDate;

  const handleEdit = () => {
    navigate(`/dashboard/users/${user.id}/edit`);
  };

  const handleRenew = () => {
    navigate(`/dashboard/users/${user.id}/edit?renovar=true`);
  };

  const handleDelete = () => {
    console.log("Eliminar usuario", user.id);
  };

  const iconButtonClasses =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  const fullName = [user.user_name, user.last_name_1].filter(Boolean).join(" ");

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        aria-label="Ver usuario"
        onClick={() => setIsViewOpen(true)}
        className={iconButtonClasses}
      >
        <Eye size={18} />
      </button>

      {canEdit && (
        <button
          type="button"
          aria-label="Editar usuario"
          onClick={handleEdit}
          className={iconButtonClasses}
        >
          <Pencil size={18} />
        </button>
      )}

      {canEdit && needsRenewal && (
        <button type="button" aria-label="Renovar usuario" onClick={handleRenew} className={iconButtonClasses}>
          <RefreshCw size={18} />
        </button>
      )}

      <Dropdown>
        <DropdownTrigger>
          <button
            type="button"
            aria-label="Acciones de usuario"
            className={iconButtonClasses}
          >
            <EllipsisVertical size={18} />
          </button>
        </DropdownTrigger>

        <DropdownContent>
          {canEdit && <DropdownItem onClick={handleEdit}>Editar</DropdownItem>}
          {canEdit && needsRenewal && <DropdownItem onClick={handleRenew}>Renovar</DropdownItem>}
          <DropdownItem onClick={handleDelete}>Opcion 2</DropdownItem>
          <DropdownItem onClick={handleDelete}>Opcion 3</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={fullName || user.user_name}
        fields={[
          {
            label: "Foto de perfil",
            value: user.avatar_url ? (
              <img src={user.avatar_url} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover" />
            ) : null,
          },
          { label: "Nombre completo", value: fullName },
          { label: "Tipo de documento", value: user.document_type },
          { label: "Número de documento", value: user.document_number },
          { label: "Correo electrónico", value: user.user_email },
          { label: "Correo institucional", value: user.institutional_email },
          { label: "Número de celular", value: user.user_phone },
          { label: "Número de celular secundario", value: user.secondary_phone },
          { label: "Dirección", value: user.address },
          { label: "Tipo de usuario", value: findGroupName(groups, user.group_id) },
          { label: "Estado", value: user.is_active ? "Activo" : "Inactivo" },
          { label: "Es cuentadante", value: user.is_custodian ? "Sí" : "No" },
          { label: "Fecha de inicio", value: user.start_date ? String(user.start_date).slice(0, 10) : null },
          { label: "Fecha de finalización", value: user.end_date ? String(user.end_date).slice(0, 10) : null },
        ]}
        onEdit={canEdit ? handleEdit : undefined}
      />
    </div>
  );
}
