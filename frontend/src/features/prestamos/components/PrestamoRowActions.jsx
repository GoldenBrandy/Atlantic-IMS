import { EllipsisVertical, Eye, Pencil, Undo2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal } from "@/shared";
import { formatUserName } from "@/features/users/services/userService";
import { LOAN_TYPE_OPTIONS } from "../services/prestamoOptionsService";
import { getPrestamoStatus } from "../services/prestamoStatus";

// Traduce un id de opcion (tipo de prestamo) a su etiqueta visible.
function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

// Traduce un id de usuario a su nombre visible usando la lista ya cargada.
function findUserName(users, id) {
  const user = users.find((user) => String(user.id) === String(id));
  return user ? formatUserName(user) : id;
}

export default function PrestamoRowActions({ prestamo, users = [] }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
  const status = getPrestamoStatus(prestamo);
  const isReturned = Boolean(prestamo.returned_at);

  const handleEdit = () => {
    navigate(`/dashboard/prestamos/${prestamo.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar prestamo", prestamo.id);
  };

  const handleReturn = () => {
    navigate(`/dashboard/devoluciones/crear?prestamoId=${prestamo.id}`);
  };

  const iconButtonClasses = "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" aria-label="Ver préstamo" onClick={() => setIsViewOpen(true)} className={iconButtonClasses}>
        <Eye size={18} />
      </button>

      <button type="button" aria-label="Editar préstamo" onClick={handleEdit} className={iconButtonClasses}>
        <Pencil size={18} />
      </button>

      {!isReturned && (
        <button type="button" aria-label="Devolver préstamo" onClick={handleReturn} className={iconButtonClasses}>
          <Undo2 size={18} />
        </button>
      )}

      <Dropdown>
        <DropdownTrigger>
          <button type="button" aria-label="Acciones de préstamo" className={iconButtonClasses}>
            <EllipsisVertical size={18} />
          </button>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
          {!isReturned && <DropdownItem onClick={handleReturn}>Devolver</DropdownItem>}
          <DropdownItem onClick={handleDelete}>Eliminar</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Préstamo #${prestamo.id}`}
        fields={[
          { label: "Ítem(s) prestado(s)", value: (prestamo.materials ?? []).map((material) => material.name).join(", ") || "-" },
          { label: "Usuario solicitante", value: findUserName(users, prestamo.requesting_user) },
          { label: "Usuario prestador", value: findUserName(users, prestamo.lending_user) },
          { label: "Ficha de aprendices", value: prestamo.ficha || "-" },
          { label: "Tipo de préstamo", value: findLabel(LOAN_TYPE_OPTIONS, prestamo.loan_type) },
          { label: "Fecha de salida", value: String(prestamo.start_date ?? "").slice(0, 10) },
          { label: "Fecha de entrega", value: String(prestamo.due_date ?? "").slice(0, 10) },
          { label: "Estado", value: status.label },
          {
            label: "Fecha de devolución",
            value: prestamo.returned_at ? String(prestamo.returned_at).slice(0, 10) : "-",
          },
          { label: "Justificación de uso", value: prestamo.justification },
          {
            label: "Firma digital",
            value: prestamo.signature_url ? (
              prestamo.signature_url.startsWith("data:image") ? (
                <img src={prestamo.signature_url} alt="Firma digital" className="h-16 max-w-[10rem] rounded border object-contain" />
              ) : (
                "Documento adjunto"
              )
            ) : null,
          },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}