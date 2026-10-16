import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, ViewDetailsModal, IconButton } from "@/shared";

export default function CotizacionRowActions({ cotizacion }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/cotizaciones/${cotizacion.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar cotización", cotizacion.id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton ariaLabel="Ver cotización" variant="ghost" hitSize={36} iconSize={18} onClick={() => setIsViewOpen(true)}>
        <Eye size={18} />
      </IconButton>

      <IconButton ariaLabel="Editar cotización" variant="ghost" hitSize={36} iconSize={18} onClick={handleEdit}>
        <Pencil size={18} />
      </IconButton>

      <Dropdown>
        <DropdownTrigger>
          <IconButton ariaLabel="Acciones de cotización" variant="ghost" hitSize={36} iconSize={18}>
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
        title={cotizacion.name}
        fields={[
          { label: "Nombre", value: cotizacion.name },
          { label: "Estado", value: cotizacion.status === "activo" ? "Activo" : "Inactivo" },
          {
            label: "Fecha",
            value: cotizacion.quotation_date ? String(cotizacion.quotation_date).slice(0, 10) : null,
          },
          {
            label: "Archivo",
            value: cotizacion.file_url ? (
              <a href={cotizacion.file_url} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
                Ver PDF
              </a>
            ) : null,
          },
        ]}
        onEdit={handleEdit}
      />
    </div>
  );
}
