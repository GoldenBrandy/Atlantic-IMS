import { X, Pencil } from "lucide-react";
import Button from "./Button";

export default function ViewDetailsModal({
  isOpen,
  onClose,
  title,
  fields = [],
  onEdit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-caption text-neutral-500">
                {field.label}
              </dt>
              <dd className="text-base text-black">
                {field.value || "-"}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {onEdit && (
            <Button variant="primary" onClick={onEdit} className="gap-2">
              <Pencil size={16} />
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
