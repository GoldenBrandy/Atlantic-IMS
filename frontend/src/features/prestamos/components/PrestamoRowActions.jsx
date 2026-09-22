import { EllipsisVertical, Ticket, Pencil, Undo2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal } from "@/shared";
import { buildTicketFields } from "../services/prestamoTicket";

export default function PrestamoRowActions({ prestamo, users = [] }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
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
      <button type="button" aria-label="Ver ticket del préstamo" onClick={() => setIsViewOpen(true)} className={iconButtonClasses}>
        <Ticket size={18} />
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
        title={`Ticket de préstamo #${prestamo.id}`}
        fields={buildTicketFields(prestamo, users)}
        onEdit={handleEdit}
      />
    </div>
  );
}