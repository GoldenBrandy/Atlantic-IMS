import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  ViewDetailsModal,
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

  const iconButtonClasses = "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300";

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" aria-label="Ver producto" onClick={() => setIsViewOpen(true)} className={iconButtonClasses}>
        <Eye size={18} />
      </button>

      <button type="button" aria-label="Editar producto" onClick={handleEdit} className={iconButtonClasses}>
        <Pencil size={18} />
      </button>

      <Dropdown>
        <DropdownTrigger>
          <button type="button" aria-label="Acciones de producto" className={iconButtonClasses}>
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