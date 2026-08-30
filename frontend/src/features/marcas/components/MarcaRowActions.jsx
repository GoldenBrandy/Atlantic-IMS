import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal } from "@/shared";

export default function MarcaRowActions({ marca }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/marcas/${marca.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar marca", marca.id);
  };

  const iconButtonClasses = "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" aria-label="Ver marca" onClick={() => setIsViewOpen(true)} className={iconButtonClasses}>
        <Eye size={18} />
      </button>

      <button type="button" aria-label="Editar marca" onClick={handleEdit} className={iconButtonClasses}>
        <Pencil size={18} />
      </button>

      <Dropdown>
        <DropdownTrigger>
          <button type="button" aria-label="Acciones de marca" className={iconButtonClasses}>
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
        title={marca.name}
        fields={[
          { label: "Nombre", value: marca.name },
          { label: "Estado", value: marca.status === "activo" ? "Activo" : "Inactivo" },
          { label: "Descripción", value: marca.description },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}