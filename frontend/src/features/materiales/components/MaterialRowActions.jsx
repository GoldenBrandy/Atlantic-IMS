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

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

// Traduce ids de cuentadantes a nombres, usando la lista de usuarios ya cargada.
function findCustodianNames(custodianIds, users) {
  if (!custodianIds?.length) return null;
  return custodianIds
    .map((id) => {
      const user = users.find((user) => String(user.id) === String(id));
      return user ? formatUserName(user) : null;
    })
    .filter(Boolean)
    .join(", ");
}

export default function MaterialRowActions({ material, users = [] }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
  const isConsumo = material.type === "Consumo";
  const isDevolutivo = material.type === "Devolutivo";
  const showExtendedFields = isConsumo || isDevolutivo;
  const custodianNames = findCustodianNames(material.custodian_ids, users);

  const handleEdit = () => {
    navigate(`/dashboard/materiales/${material.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar material", material.id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver material" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar material" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de material" variant="ghost" hitSize={36} iconSize={18}>
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
        title={material.name}
        fields={[
          {
            label: "Foto(s)",
            value: material.image_urls?.length ? (
              <div className="flex gap-2">
                {material.image_urls.map((url, index) => (
                  <img key={index} src={url} alt={`Foto ${index + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            ) : null,
          },
          { label: "Nombre", value: material.name },
          { label: "Tipo", value: material.type },
          { label: "Cantidad", value: material.quantity },
          { label: "Descripción", value: material.description },
          {
            label: "Estado",
            value: material.is_active ? "Activo" : "Inactivo",
          },
          ...(showExtendedFields
            ? [
                {
                  label: "Ficha(s) técnica(s)",
                  value: material.technical_sheet_urls?.length ? (
                    <div className="flex gap-2">
                      {material.technical_sheet_urls.map((url, index) => (
                        <img key={index} src={url} alt={`Ficha técnica ${index + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  ) : null,
                },
                {
                  label: "Cotizaciones",
                  value: material.cotizaciones?.length ? (
                    <div className="flex flex-col gap-1">
                      {material.cotizaciones.map((cotizacion) => (
                        <div key={cotizacion.id} className="flex flex-wrap items-center gap-2">
                          <a href={cotizacion.file_url} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
                            {cotizacion.name}
                          </a>
                          {cotizacion.quotation_date && (
                            <span className="text-caption text-neutral-600">{String(cotizacion.quotation_date).slice(0, 10)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null,
                },
                { label: "Placa SENA", value: material.sena_plate },
                { label: "Marca", value: material.marca_name },
                { label: "Inventario", value: material.inventario_name },
                { label: "Ubicación", value: material.location },
                { label: "Fecha compra", value: material.purchase_date ? String(material.purchase_date).slice(0, 10) : null },
                { label: "Fecha ingreso", value: material.entry_date ? String(material.entry_date).slice(0, 10) : null },
                { label: "Valor unitario", value: material.unit_value ? currencyFormatter.format(material.unit_value) : null },
                { label: "Valor Total", value: material.total_value ? currencyFormatter.format(material.total_value) : null },
              ]
            : []),
          ...(showExtendedFields ? [{ label: "Cuentadante(s)", value: custodianNames || null }] : []),
          ...(isDevolutivo
            ? [
                { label: "Modelo", value: material.model },
                { label: "Categoría", value: material.categoria_name },
                { label: "ID", value: material.external_id },
              ]
            : []),
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}