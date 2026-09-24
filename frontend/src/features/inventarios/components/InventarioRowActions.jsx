// Acciones por fila de la tabla de inventarios: ver detalle, editar y el
// menu de acciones adicionales (mismo patron que MarcaRowActions).
import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal, IconButton } from "@/shared";

export default function InventarioRowActions({ inventario }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/inventarios/${inventario.id}/edit`);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver inventario" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar inventario" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de inventario" variant="ghost" hitSize={36} iconSize={18}>
            <EllipsisVertical size={18} />
          </IconButton>
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
