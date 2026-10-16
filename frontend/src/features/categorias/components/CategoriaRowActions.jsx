import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal, IconButton } from "@/shared";

export default function CategoriaRowActions({ categoria }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/categorias/${categoria.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar categoría", categoria.id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver categoría" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar categoría" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de categoría" variant="ghost" hitSize={36} iconSize={18}>
            <EllipsisVertical size={18} />
          </IconButton>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
          <DropdownItem onClick={handleDelete}>Eliminar</DropdownItem>
        </DropdownContent>
      </Dropdown>

      <ViewDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={categoria.name}
        fields={[
          { label: "Nombre", value: categoria.name },
          { label: "Estado", value: categoria.status === "activo" ? "Activo" : "Inactivo" },
          { label: "Descripción", value: categoria.description },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}
