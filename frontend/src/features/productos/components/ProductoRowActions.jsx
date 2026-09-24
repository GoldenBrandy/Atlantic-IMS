import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  ViewDetailsModal,
  IconButton,
} from "@/shared";
import { formatUserName } from "@/features/users/services/userService";
import { PRODUCT_TYPE_OPTIONS, CATEGORY_OPTIONS } from "../services/productoOptionsService";

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function findUserName(users, id) {
  const user = users.find((user) => String(user.id) === String(id));
  return user ? formatUserName(user) : null;
}

export default function ProductoRowActions({ producto, users = [] }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/productos/${producto.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar producto", producto.id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver producto" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar producto" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de producto" variant="ghost" hitSize={36} iconSize={18}>
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
        title={producto.name}
        fields={[
          {
            label: "Foto",
            value: producto.image_url ? (
              <img src={producto.image_url} alt={producto.name} className="h-16 w-16 rounded-lg object-cover" />
            ) : null,
          },
          { label: "Nombre", value: producto.name },
          { label: "Código de producto", value: producto.product_code },
          { label: "Tipo", value: findLabel(PRODUCT_TYPE_OPTIONS, producto.type) },
          { label: "Categoría", value: findLabel(CATEGORY_OPTIONS, producto.category) },
          { label: "Responsable", value: findUserName(users, producto.responsible) },
          { label: "Estado", value: producto.status === "activo" ? "Activo" : "Inactivo" },
          { label: "Último movimiento", value: producto.last_movement },
          { label: "Ubicación", value: producto.location },
          { label: "Cantidad", value: producto.quantity },
          { label: "Proveedor / origen", value: producto.supplier },
          { label: "Observaciones", value: producto.observations },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}