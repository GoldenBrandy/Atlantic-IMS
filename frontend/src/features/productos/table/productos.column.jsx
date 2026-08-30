import { Switch } from "@/shared";
import { formatUserName } from "@/features/users/services/userService";
import {
  PRODUCT_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
} from "../services/productoOptionsService";
import ProductoRowActions from "../components/ProductoRowActions";

// Traduce un id de opcion (tipo, categoria) a su etiqueta visible.
function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

// Traduce un id de usuario responsable a su nombre visible usando la lista ya cargada.
function findUserName(users, id) {
  const user = users.find((user) => String(user.id) === String(id));
  return user ? formatUserName(user) : id;
}

// Genera las columnas de la tabla. Recibe la lista de usuarios ya cargada
// (via API) para poder traducir responsible -> nombre de forma sincrona, y
// onToggleStatus(producto, nextValue) para el switch individual de estado.
// La tabla no incluye la columna "id" a proposito.
export function getProductoColumns(users = [], onToggleStatus) {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "product_code",
      header: "Codigo de producto",
    },
    {
      id: "type",
      header: "Tipo",
      cell: ({ row }) => findLabel(PRODUCT_TYPE_OPTIONS, row.original.type),
    },
    {
      id: "category",
      header: "Categoria",
      cell: ({ row }) => findLabel(CATEGORY_OPTIONS, row.original.category),
    },
    {
      id: "responsible",
      header: "Responsable",
      cell: ({ row }) => findUserName(users, row.original.responsible),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const producto = row.original;
        const isActive = producto.status === "activo";

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onChange={(value) => onToggleStatus?.(producto, value)}
            />
            <span className={`text-caption font-medium ${isActive ? "text-green-700" : "text-neutral-400"}`}>
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "last_movement",
      header: "Ultimo movimiento",
    },
    {
      accessorKey: "location",
      header: "Ubicacion",
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
    },
    {
      accessorKey: "supplier",
      header: "Proveedor / origen",
    },
    {
      accessorKey: "observations",
      header: "Observaciones",
    },
    {
      id: "actions",
      cell: ({ row }) => <ProductoRowActions producto={row.original} users={users} />,
    },
  ];
}