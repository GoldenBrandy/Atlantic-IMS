import { EllipsisVertical, Ticket, Pencil, Undo2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal, IconButton } from "@/shared";
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

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver ticket del préstamo" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Ticket size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar préstamo" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      {!isReturned && (
        <IconButton ariaLabel="Devolver préstamo" variant="ghost" hitSize={36} iconSize={18} onClick={handleReturn}>
          <Undo2 size={18} />
        </IconButton>
      )}

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de préstamo" variant="ghost" hitSize={36} iconSize={18}>
            <EllipsisVertical size={18} />
          </IconButton>
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