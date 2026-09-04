// Acciones por fila de la tabla de inventarios: ver detalle, editar y el
// menu de acciones adicionales (mismo patron que MarcaRowActions).
import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal } from "@/shared";

export default function InventarioRowActions({ inventario }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/inventarios/${inventario.id}/edit`);
  };

  const iconButtonClasses = "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" aria-label="Ver inventario" onClick={() => setIsViewOpen(true)} className={iconButtonClasses}>
        <Eye size={18} />
      </button>

      <button type="button" aria-label="Editar inventario" onClick={handleEdit} className={iconButtonClasses}>
        <Pencil size={18} />
      </button>

      <Dropdown>
        <DropdownTrigger>
          <button type="button" aria-label="Acciones de inventario" className={iconButtonClasses}>
            <EllipsisVertical size={18} />
          </button>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={inventario.name}
        fields={[
          { label: "Nombre", value: inventario.name },
          { label: "Estado", value: inventario.is_active ? "Activo" : "Inactivo" },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}
