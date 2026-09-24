import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal, IconButton } from "@/shared";

export default function GrupoRowActions({ grupo }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/grupos/${grupo.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar grupo", grupo.id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver grupo" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar grupo" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de grupo" variant="ghost" hitSize={36} iconSize={18}>
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
        title={grupo.group_name}
        fields={[
          { label: "Nombre", value: grupo.group_name },
          { label: "Código", value: grupo.group_code },
          { label: "Estado", value: grupo.is_active ? "Activo" : "Inactivo" },
          { label: "Descripción", value: grupo.description },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}